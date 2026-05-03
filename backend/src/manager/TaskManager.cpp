#include "TaskManager.h"

#include <algorithm>
#include <stdexcept>
#include <unordered_map>

#include "../utils/TimeUtils.h"

TaskManager::TaskManager() = default;

void TaskManager::hydrate(const std::vector<std::shared_ptr<Task>>& tasks) {
  tasks_.clear();
  for (const auto& task : tasks) tasks_.push_back(task->clone());
  rebuildPriorityQueue();
}

std::vector<std::shared_ptr<Task>> TaskManager::getTasks() const { return snapshot(); }

std::shared_ptr<Task> TaskManager::addTask(const std::shared_ptr<Task>& task) {
  auto before = snapshot();
  auto candidate = before;
  auto nextTask = task->clone();
  validateDependencies(candidate, nextTask->getDependsOn(), nextTask->getId());
  nextTask->execute(*this, nextTask->getStatus());
  candidate.push_back(nextTask);
  ensureAcyclic(candidate);
  tasks_ = candidate;
  rebuildPriorityQueue();
  auto after = snapshot();
  recordHistory("create", before, after);
  return findTaskOrThrow(nextTask->getId())->clone();
}

std::shared_ptr<Task> TaskManager::updateTask(const std::string& id, const nlohmann::json& patch) {
  auto before = snapshot();
  auto candidate = before;
  const auto it = std::find_if(candidate.begin(), candidate.end(), [&](const auto& task) { return task->getId() == id; });
  if (it == candidate.end()) {
    throw std::out_of_range("Task not found");
  }
  auto task = *it;
  const auto previousStatus = task->getStatus();

  if (patch.contains("id") || patch.contains("type") || patch.contains("createdAt")) {
    throw std::invalid_argument("id, type, and createdAt are immutable");
  }
  if (patch.contains("title")) task->setTitle(patch.at("title").get<std::string>());
  if (patch.contains("description")) task->setDescription(patch.at("description").get<std::string>());
  if (patch.contains("dueDate")) {
    const auto dueDate = patch.at("dueDate").get<std::string>();
    time_utils::parseUtc(dueDate);
    task->setDueDate(dueDate);
  }
  if (patch.contains("priority")) task->setPriority(priorityFromString(patch.at("priority").get<std::string>()));
  if (patch.contains("status")) task->setStatus(statusFromString(patch.at("status").get<std::string>()));
  if (patch.contains("deadlineHours")) {
    auto urgentTask = std::dynamic_pointer_cast<UrgentTask>(task);
    if (!urgentTask) throw std::invalid_argument("deadlineHours only applies to urgent tasks");
    urgentTask->setDeadlineHours(patch.at("deadlineHours").get<int>());
  }
  if (patch.contains("intervalDays")) {
    auto recurringTask = std::dynamic_pointer_cast<RecurringTask>(task);
    if (!recurringTask) throw std::invalid_argument("intervalDays only applies to recurring tasks");
    recurringTask->setIntervalDays(patch.at("intervalDays").get<int>());
  }
  if (patch.contains("dependsOn")) {
    auto dependentTask = std::dynamic_pointer_cast<DependentTask>(task);
    if (!dependentTask) throw std::invalid_argument("dependsOn only applies to dependent tasks");
    dependentTask->setDependsOn(patch.at("dependsOn").get<std::vector<std::string>>());
  }

  validateDependencies(candidate, task->getDependsOn(), id);
  task->execute(*this, previousStatus);
  ensureAcyclic(candidate);
  tasks_ = candidate;
  rebuildPriorityQueue();
  auto after = snapshot();
  recordHistory("update", before, after);
  return findTaskOrThrow(id)->clone();
}

void TaskManager::removeTask(const std::string& id) {
  if (dependencyReferencesTask(id)) {
    throw std::logic_error("Task is referenced by another dependency");
  }

  auto before = snapshot();
  const auto originalSize = tasks_.size();
  tasks_.erase(std::remove_if(tasks_.begin(), tasks_.end(), [&](const auto& task) { return task->getId() == id; }), tasks_.end());
  if (tasks_.size() == originalSize) {
    throw std::out_of_range("Task not found");
  }
  rebuildPriorityQueue();
  auto after = snapshot();
  recordHistory("delete", before, after);
}

std::shared_ptr<Task> TaskManager::startTaskTimer(const std::string& id) {
  auto before = snapshot();
  auto task = findTaskOrThrow(id);
  if (task->isTimerRunning()) {
    throw std::logic_error("Timer already running");
  }
  task->setActiveStartedAt(nowUtc());
  rebuildPriorityQueue();
  auto after = snapshot();
  recordHistory("start", before, after);
  return task->clone();
}

std::shared_ptr<Task> TaskManager::stopTaskTimer(const std::string& id) {
  auto before = snapshot();
  auto task = findTaskOrThrow(id);
  if (!task->isTimerRunning()) {
    throw std::logic_error("Timer not running");
  }
  const auto stoppedAt = nowUtc();
  task->addTimeSpentSeconds(time_utils::elapsedSeconds(task->getActiveStartedAt(), stoppedAt));
  task->setActiveStartedAt("");
  rebuildPriorityQueue();
  auto after = snapshot();
  recordHistory("stop", before, after);
  return task->clone();
}

RestoreResult TaskManager::undoLast() {
  if (undoStack_.empty()) {
    throw std::logic_error("Nothing to undo");
  }
  const auto entry = undoStack_.top();
  undoStack_.pop();
  redoStack_.push(entry);
  restoreFrom(entry.before);
  return {entry.action, tasks_.size()};
}

RestoreResult TaskManager::redoLast() {
  if (redoStack_.empty()) {
    throw std::logic_error("Nothing to redo");
  }
  const auto entry = redoStack_.top();
  redoStack_.pop();
  undoStack_.push(entry);
  restoreFrom(entry.after);
  return {entry.action, tasks_.size()};
}

std::shared_ptr<Task> TaskManager::getNextPriority() const {
  if (priorityQueue_.empty()) return nullptr;
  return priorityQueue_.top()->clone();
}

std::vector<std::shared_ptr<Task>> TaskManager::getTopologicalOrder() const {
  std::unordered_map<std::string, std::shared_ptr<Task>> byId;
  std::unordered_map<std::string, int> indegree;
  std::unordered_map<std::string, std::vector<std::string>> adjacency;

  for (const auto& task : tasks_) {
    byId[task->getId()] = task;
    indegree[task->getId()] = 0;
  }
  for (const auto& task : tasks_) {
    for (const auto& depId : task->getDependsOn()) {
      if (!byId.count(depId)) {
        throw std::invalid_argument("Missing dependency id: " + depId);
      }
      adjacency[depId].push_back(task->getId());
      indegree[task->getId()] += 1;
    }
  }

  std::vector<std::shared_ptr<Task>> zero;
  for (const auto& task : tasks_) {
    if (indegree[task->getId()] == 0) zero.push_back(task);
  }
  std::sort(zero.begin(), zero.end(), [](const auto& lhs, const auto& rhs) { return lhs->getCreatedAt() < rhs->getCreatedAt(); });

  std::vector<std::shared_ptr<Task>> ordered;
  while (!zero.empty()) {
    auto current = zero.front();
    zero.erase(zero.begin());
    ordered.push_back(current->clone());
    for (const auto& adjacentId : adjacency[current->getId()]) {
      indegree[adjacentId] -= 1;
      if (indegree[adjacentId] == 0) {
        zero.push_back(byId[adjacentId]);
        std::sort(zero.begin(), zero.end(), [](const auto& lhs, const auto& rhs) { return lhs->getCreatedAt() < rhs->getCreatedAt(); });
      }
    }
  }

  if (ordered.size() != tasks_.size()) {
    throw std::invalid_argument("Dependency cycle detected");
  }
  return ordered;
}

bool TaskManager::areTasksDone(const std::vector<std::string>& ids) const {
  for (const auto& id : ids) {
    auto task = findTaskOrThrow(id);
    if (task->getStatus() != Status::DONE) return false;
  }
  return true;
}

std::string TaskManager::nowUtc() const { return time_utils::nowUtcIso(); }

bool TaskManager::TaskCompare::operator()(const std::shared_ptr<Task>& lhs, const std::shared_ptr<Task>& rhs) const {
  if (lhs->getPriority() != rhs->getPriority()) {
    return static_cast<int>(lhs->getPriority()) < static_cast<int>(rhs->getPriority());
  }
  if (lhs->getDueDate() != rhs->getDueDate()) {
    return lhs->getDueDate() > rhs->getDueDate();
  }
  return lhs->getCreatedAt() > rhs->getCreatedAt();
}

std::vector<std::shared_ptr<Task>> TaskManager::snapshot() const {
  std::vector<std::shared_ptr<Task>> copy;
  for (const auto& task : tasks_) copy.push_back(task->clone());
  return copy;
}

std::shared_ptr<Task> TaskManager::findTaskOrThrow(const std::string& id) const {
  const auto it = std::find_if(tasks_.begin(), tasks_.end(), [&](const auto& task) { return task->getId() == id; });
  if (it == tasks_.end()) {
    throw std::out_of_range("Task not found");
  }
  return *it;
}

void TaskManager::rebuildPriorityQueue() {
  priorityQueue_ = {};
  for (const auto& task : tasks_) {
    priorityQueue_.push(task);
  }
}

void TaskManager::recordHistory(const std::string& action, const std::vector<std::shared_ptr<Task>>& before, const std::vector<std::shared_ptr<Task>>& after) {
  undoStack_.push({action, before, after});
  redoStack_ = {};
}

void TaskManager::restoreFrom(const std::vector<std::shared_ptr<Task>>& state) {
  tasks_.clear();
  for (const auto& task : state) tasks_.push_back(task->clone());
  rebuildPriorityQueue();
}

void TaskManager::validateDependencies(const std::vector<std::shared_ptr<Task>>& tasks, const std::vector<std::string>& dependsOn, const std::string& selfId) const {
  for (const auto& dependency : dependsOn) {
    if (dependency == selfId) {
      throw std::invalid_argument("Task cannot depend on itself");
    }
    const auto it = std::find_if(tasks.begin(), tasks.end(), [&](const auto& task) { return task->getId() == dependency; });
    if (it == tasks.end()) {
      throw std::out_of_range("Task not found");
    }
  }
}

void TaskManager::ensureAcyclic(const std::vector<std::shared_ptr<Task>>& tasks) const {
  std::unordered_map<std::string, int> indegree;
  std::unordered_map<std::string, std::vector<std::string>> adjacency;

  for (const auto& task : tasks) {
    indegree[task->getId()] = 0;
  }
  for (const auto& task : tasks) {
    for (const auto& depId : task->getDependsOn()) {
      adjacency[depId].push_back(task->getId());
      indegree[task->getId()] += 1;
    }
  }

  std::vector<std::string> zero;
  for (const auto& task : tasks) {
    if (indegree[task->getId()] == 0) zero.push_back(task->getId());
  }

  std::size_t visited = 0;
  while (!zero.empty()) {
    const auto currentId = zero.back();
    zero.pop_back();
    visited += 1;
    for (const auto& adjacentId : adjacency[currentId]) {
      indegree[adjacentId] -= 1;
      if (indegree[adjacentId] == 0) zero.push_back(adjacentId);
    }
  }

  if (visited != tasks.size()) {
    throw std::invalid_argument("Dependency cycle detected");
  }
}

bool TaskManager::dependencyReferencesTask(const std::string& taskId) const {
  return std::any_of(tasks_.begin(), tasks_.end(), [&](const auto& task) {
    const auto dependsOn = task->getDependsOn();
    return std::find(dependsOn.begin(), dependsOn.end(), taskId) != dependsOn.end();
  });
}
