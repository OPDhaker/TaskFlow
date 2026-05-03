#pragma once

#include <sqlite3.h>

#include <string>
#include <vector>

#include "../models/TaskFactory.h"

class TaskRepository {
 public:
  explicit TaskRepository(const std::string& databasePath);
  ~TaskRepository();

  void initialize();
  std::vector<std::shared_ptr<Task>> loadTasks() const;
  void saveTasks(const std::vector<std::shared_ptr<Task>>& tasks) const;

 private:
  sqlite3* db_;
};
