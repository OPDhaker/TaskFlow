#include <algorithm>
#include <cassert>
#include <cstdio>
#include <iostream>

#include "../src/manager/TaskManager.h"
#include "../src/persistence/TaskRepository.h"

int main() {
  TaskManager manager;

  auto basic = taskFromJson({{"type", "basic"}, {"title", "Read notes"}, {"description", "Chapter 2"}, {"dueDate", "2026-05-02T10:00:00Z"}, {"priority", "LOW"}});
  auto urgent = taskFromJson({{"type", "urgent"}, {"title", "Submit lab"}, {"description", "OOP demo"}, {"dueDate", "2026-05-01T16:00:00Z"}, {"priority", "HIGH"}, {"deadlineHours", 4}});
  auto recurring = taskFromJson({{"type", "recurring"}, {"title", "Daily sync"}, {"description", "Five minute recap"}, {"dueDate", "2026-05-03T08:00:00Z"}, {"priority", "MEDIUM"}, {"intervalDays", 7}});

  manager.addTask(basic);
  manager.addTask(urgent);
  manager.addTask(recurring);

  assert(manager.getTasks().size() == 3);
  assert(manager.getNextPriority()->getId() == urgent->getId());
  assert(manager.getNextPriority()->toJson().at("priority").get<std::string>() == "URGENT");

  manager.updateTask(recurring->getId(), {{"status", "DONE"}});
  const auto recurringJson = manager.updateTask(recurring->getId(), {{"description", "Updated"}})->toJson();
  assert(recurringJson.at("nextOccurrence").get<std::string>().size() > 0);

  auto dependent = taskFromJson({
      {"type", "dependent"},
      {"title", "Present final demo"},
      {"description", "After lab submission"},
      {"dueDate", "2026-05-05T10:00:00Z"},
      {"priority", "HIGH"},
      {"dependsOn", std::vector<std::string> {urgent->getId()}}
  });
  manager.addTask(dependent);
  bool blocked = false;
  try {
    manager.updateTask(dependent->getId(), {{"status", "IN_PROGRESS"}});
  } catch (const std::logic_error&) {
    blocked = true;
  }
  assert(blocked);
  const auto blockedTask = manager.getTasks();
  const auto blockedIt = std::find_if(blockedTask.begin(), blockedTask.end(), [&](const auto& task) { return task->getId() == dependent->getId(); });
  assert(blockedIt != blockedTask.end());
  assert((*blockedIt)->getStatus() == Status::TODO);

  manager.updateTask(urgent->getId(), {{"status", "DONE"}});
  assert(manager.updateTask(dependent->getId(), {{"status", "IN_PROGRESS"}})->getStatus() == Status::IN_PROGRESS);

  manager.startTaskTimer(basic->getId());
  assert(manager.getTasks()[0]->isTimerRunning());
  manager.stopTaskTimer(basic->getId());
  assert(!manager.getTasks()[0]->isTimerRunning());

  const auto beforeDelete = manager.getTasks().size();
  manager.removeTask(recurring->getId());
  assert(manager.getTasks().size() == beforeDelete - 1);
  manager.undoLast();
  assert(manager.getTasks().size() == beforeDelete);
  manager.redoLast();
  assert(manager.getTasks().size() == beforeDelete - 1);

  const auto ordered = manager.getTopologicalOrder();
  assert(!ordered.empty());

  TaskManager cyclic;
  auto a = taskFromJson({{"type", "dependent"}, {"id", "a"}, {"createdAt", "2026-05-01T00:00:00Z"}, {"title", "A"}, {"description", ""}, {"dueDate", "2026-05-03T00:00:00Z"}, {"priority", "LOW"}, {"dependsOn", std::vector<std::string> {"b"}}});
  auto b = taskFromJson({{"type", "dependent"}, {"id", "b"}, {"createdAt", "2026-05-01T00:00:01Z"}, {"title", "B"}, {"description", ""}, {"dueDate", "2026-05-03T00:00:00Z"}, {"priority", "LOW"}, {"dependsOn", std::vector<std::string> {"a"}}});
  cyclic.hydrate({a, b});
  bool cycleDetected = false;
  try {
    cyclic.getTopologicalOrder();
  } catch (const std::invalid_argument&) {
    cycleDetected = true;
  }
  assert(cycleDetected);

  TaskManager writeCycle;
  auto cycleA = taskFromJson({{"type", "dependent"}, {"title", "Cycle A"}, {"description", ""}, {"dueDate", "2026-05-06T00:00:00Z"}, {"priority", "LOW"}, {"dependsOn", std::vector<std::string> {}}});
  writeCycle.addTask(cycleA);
  auto cycleB = taskFromJson({{"type", "dependent"}, {"title", "Cycle B"}, {"description", ""}, {"dueDate", "2026-05-06T01:00:00Z"}, {"priority", "LOW"}, {"dependsOn", std::vector<std::string> {cycleA->getId()}}});
  writeCycle.addTask(cycleB);
  bool writeCycleDetected = false;
  try {
    writeCycle.updateTask(cycleA->getId(), {{"dependsOn", std::vector<std::string> {cycleB->getId()}}});
  } catch (const std::invalid_argument&) {
    writeCycleDetected = true;
  }
  assert(writeCycleDetected);
  const auto writeCycleTasks = writeCycle.getTasks();
  const auto cycleAIt = std::find_if(writeCycleTasks.begin(), writeCycleTasks.end(), [&](const auto& task) { return task->getId() == cycleA->getId(); });
  assert(cycleAIt != writeCycleTasks.end());
  assert((*cycleAIt)->getDependsOn().empty());

  const std::string dbPath = "/private/tmp/task_manager_tests.db";
  std::remove(dbPath.c_str());
  TaskRepository repository(dbPath);
  repository.initialize();
  repository.saveTasks(manager.getTasks());
  const auto loaded = repository.loadTasks();
  assert(!loaded.empty());
  assert(loaded.front()->toJson().contains("type"));

  std::cout << "All task manager tests passed\n";
  return 0;
}
