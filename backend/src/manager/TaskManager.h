#pragma once

#include <memory>
#include <queue>
#include <stack>
#include <string>
#include <vector>

#include "../models/TaskFactory.h"

struct HistoryEntry {
  std::string action;
  std::vector<std::shared_ptr<Task>> before;
  std::vector<std::shared_ptr<Task>> after;
};

struct RestoreResult {
  std::string action;
  std::size_t taskCount;
};

class TaskManager : public TaskExecutionContext {
 public:
  TaskManager();

  void hydrate(const std::vector<std::shared_ptr<Task>>& tasks);
  std::vector<std::shared_ptr<Task>> getTasks() const;
  std::shared_ptr<Task> addTask(const std::shared_ptr<Task>& task);
  std::shared_ptr<Task> updateTask(const std::string& id, const nlohmann::json& patch);
  void removeTask(const std::string& id);
  std::shared_ptr<Task> startTaskTimer(const std::string& id);
  std::shared_ptr<Task> stopTaskTimer(const std::string& id);
  RestoreResult undoLast();
  RestoreResult redoLast();
  std::shared_ptr<Task> getNextPriority() const;
  std::vector<std::shared_ptr<Task>> getTopologicalOrder() const;

  bool areTasksDone(const std::vector<std::string>& ids) const override;
  std::string nowUtc() const override;

 private:
  struct TaskCompare {
    bool operator()(const std::shared_ptr<Task>& lhs, const std::shared_ptr<Task>& rhs) const;
  };

  std::vector<std::shared_ptr<Task>> snapshot() const;
  std::shared_ptr<Task> findTaskOrThrow(const std::string& id) const;
  void rebuildPriorityQueue();
  void recordHistory(const std::string& action, const std::vector<std::shared_ptr<Task>>& before, const std::vector<std::shared_ptr<Task>>& after);
  void restoreFrom(const std::vector<std::shared_ptr<Task>>& state);
  void validateDependencies(const std::vector<std::shared_ptr<Task>>& tasks, const std::vector<std::string>& dependsOn, const std::string& selfId = "") const;
  void ensureAcyclic(const std::vector<std::shared_ptr<Task>>& tasks) const;
  bool dependencyReferencesTask(const std::string& taskId) const;

  std::vector<std::shared_ptr<Task>> tasks_;
  std::priority_queue<std::shared_ptr<Task>, std::vector<std::shared_ptr<Task>>, TaskCompare> priorityQueue_;
  std::stack<HistoryEntry> undoStack_;
  std::stack<HistoryEntry> redoStack_;
};
