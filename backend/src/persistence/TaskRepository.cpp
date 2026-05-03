#include "TaskRepository.h"

#include <stdexcept>

TaskRepository::TaskRepository(const std::string& databasePath) : db_(nullptr) {
  if (sqlite3_open(databasePath.c_str(), &db_) != SQLITE_OK) {
    throw std::runtime_error("Failed to open sqlite database");
  }
}

TaskRepository::~TaskRepository() {
  if (db_) sqlite3_close(db_);
}

void TaskRepository::initialize() {
  const char* sql =
      "CREATE TABLE IF NOT EXISTS tasks ("
      "id TEXT PRIMARY KEY,"
      "type TEXT NOT NULL,"
      "title TEXT NOT NULL,"
      "description TEXT,"
      "due_date TEXT NOT NULL,"
      "priority TEXT NOT NULL,"
      "status TEXT NOT NULL,"
      "created_at TEXT NOT NULL,"
      "time_spent_seconds INTEGER NOT NULL,"
      "deadline_hours INTEGER,"
      "interval_days INTEGER,"
      "next_occurrence TEXT,"
      "depends_on_json TEXT,"
      "active_started_at TEXT"
      ");";
  char* error = nullptr;
  if (sqlite3_exec(db_, sql, nullptr, nullptr, &error) != SQLITE_OK) {
    const std::string message = error ? error : "Failed to initialize schema";
    sqlite3_free(error);
    throw std::runtime_error(message);
  }
}

std::vector<std::shared_ptr<Task>> TaskRepository::loadTasks() const {
  sqlite3_stmt* statement = nullptr;
  const char* sql = "SELECT id, type, title, description, due_date, priority, status, created_at, time_spent_seconds, deadline_hours, interval_days, next_occurrence, depends_on_json, active_started_at FROM tasks;";
  if (sqlite3_prepare_v2(db_, sql, -1, &statement, nullptr) != SQLITE_OK) {
    throw std::runtime_error("Failed to prepare load query");
  }

  std::vector<std::shared_ptr<Task>> tasks;
  while (sqlite3_step(statement) == SQLITE_ROW) {
    nlohmann::json json = {
        {"id", reinterpret_cast<const char*>(sqlite3_column_text(statement, 0))},
        {"type", reinterpret_cast<const char*>(sqlite3_column_text(statement, 1))},
        {"title", reinterpret_cast<const char*>(sqlite3_column_text(statement, 2))},
        {"description", sqlite3_column_text(statement, 3) ? reinterpret_cast<const char*>(sqlite3_column_text(statement, 3)) : ""},
        {"dueDate", reinterpret_cast<const char*>(sqlite3_column_text(statement, 4))},
        {"priority", reinterpret_cast<const char*>(sqlite3_column_text(statement, 5))},
        {"status", reinterpret_cast<const char*>(sqlite3_column_text(statement, 6))},
        {"createdAt", reinterpret_cast<const char*>(sqlite3_column_text(statement, 7))},
        {"timeSpentSeconds", sqlite3_column_int64(statement, 8)},
        {"activeStartedAt", sqlite3_column_text(statement, 13) ? reinterpret_cast<const char*>(sqlite3_column_text(statement, 13)) : ""},
    };
    if (sqlite3_column_type(statement, 9) != SQLITE_NULL) json["deadlineHours"] = sqlite3_column_int(statement, 9);
    if (sqlite3_column_type(statement, 10) != SQLITE_NULL) json["intervalDays"] = sqlite3_column_int(statement, 10);
    if (sqlite3_column_type(statement, 11) != SQLITE_NULL) json["nextOccurrence"] = reinterpret_cast<const char*>(sqlite3_column_text(statement, 11));
    if (sqlite3_column_type(statement, 12) != SQLITE_NULL) json["dependsOn"] = nlohmann::json::parse(reinterpret_cast<const char*>(sqlite3_column_text(statement, 12)));
    tasks.push_back(taskFromJson(json));
  }
  sqlite3_finalize(statement);
  return tasks;
}

void TaskRepository::saveTasks(const std::vector<std::shared_ptr<Task>>& tasks) const {
  char* error = nullptr;
  if (sqlite3_exec(db_, "BEGIN TRANSACTION;", nullptr, nullptr, &error) != SQLITE_OK) {
    const std::string message = error ? error : "Failed to begin transaction";
    sqlite3_free(error);
    throw std::runtime_error(message);
  }
  try {
    if (sqlite3_exec(db_, "DELETE FROM tasks;", nullptr, nullptr, &error) != SQLITE_OK) {
      const std::string message = error ? error : "Failed to clear tasks";
      sqlite3_free(error);
      throw std::runtime_error(message);
    }

    sqlite3_stmt* statement = nullptr;
    const char* sql =
        "INSERT INTO tasks (id, type, title, description, due_date, priority, status, created_at, time_spent_seconds, deadline_hours, interval_days, next_occurrence, depends_on_json, active_started_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    if (sqlite3_prepare_v2(db_, sql, -1, &statement, nullptr) != SQLITE_OK) {
      throw std::runtime_error("Failed to prepare insert statement");
    }

    for (const auto& task : tasks) {
      const auto json = task->toJson();
      sqlite3_bind_text(statement, 1, task->getId().c_str(), -1, SQLITE_TRANSIENT);
      sqlite3_bind_text(statement, 2, task->getType().c_str(), -1, SQLITE_TRANSIENT);
      sqlite3_bind_text(statement, 3, task->getTitle().c_str(), -1, SQLITE_TRANSIENT);
      sqlite3_bind_text(statement, 4, task->getDescription().c_str(), -1, SQLITE_TRANSIENT);
      sqlite3_bind_text(statement, 5, task->getDueDate().c_str(), -1, SQLITE_TRANSIENT);
      const auto priority = toString(task->getPriority());
      const auto status = toString(task->getStatus());
      sqlite3_bind_text(statement, 6, priority.c_str(), -1, SQLITE_TRANSIENT);
      sqlite3_bind_text(statement, 7, status.c_str(), -1, SQLITE_TRANSIENT);
      sqlite3_bind_text(statement, 8, task->getCreatedAt().c_str(), -1, SQLITE_TRANSIENT);
      sqlite3_bind_int64(statement, 9, task->getTimeSpentSeconds());
      if (json.contains("deadlineHours")) sqlite3_bind_int(statement, 10, json["deadlineHours"].get<int>()); else sqlite3_bind_null(statement, 10);
      if (json.contains("intervalDays")) sqlite3_bind_int(statement, 11, json["intervalDays"].get<int>()); else sqlite3_bind_null(statement, 11);
      if (json.contains("nextOccurrence")) sqlite3_bind_text(statement, 12, json["nextOccurrence"].get_ref<const std::string&>().c_str(), -1, SQLITE_TRANSIENT); else sqlite3_bind_null(statement, 12);
      if (json.contains("dependsOn")) {
        const auto dependsOn = json["dependsOn"].dump();
        sqlite3_bind_text(statement, 13, dependsOn.c_str(), -1, SQLITE_TRANSIENT);
      } else {
        sqlite3_bind_null(statement, 13);
      }
      if (task->getActiveStartedAt().empty()) sqlite3_bind_null(statement, 14); else sqlite3_bind_text(statement, 14, task->getActiveStartedAt().c_str(), -1, SQLITE_TRANSIENT);

      if (sqlite3_step(statement) != SQLITE_DONE) {
        sqlite3_finalize(statement);
        throw std::runtime_error("Failed to persist task");
      }
      sqlite3_reset(statement);
      sqlite3_clear_bindings(statement);
    }

    sqlite3_finalize(statement);
    if (sqlite3_exec(db_, "COMMIT;", nullptr, nullptr, &error) != SQLITE_OK) {
      const std::string message = error ? error : "Failed to commit transaction";
      sqlite3_free(error);
      throw std::runtime_error(message);
    }
  } catch (...) {
    sqlite3_exec(db_, "ROLLBACK;", nullptr, nullptr, nullptr);
    throw;
  }
}
