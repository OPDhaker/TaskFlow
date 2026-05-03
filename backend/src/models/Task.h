#pragma once

#include <memory>
#include <ostream>
#include <string>
#include <vector>

#include <nlohmann/json.hpp>

enum class Priority { LOW = 0, MEDIUM = 1, HIGH = 2, URGENT = 3 };
enum class Status { TODO = 0, IN_PROGRESS = 1, DONE = 2 };

class TaskExecutionContext {
 public:
  virtual ~TaskExecutionContext() = default;
  virtual bool areTasksDone(const std::vector<std::string>& ids) const = 0;
  virtual std::string nowUtc() const = 0;
};

class Task {
 public:
  Task(std::string id,
       std::string title,
       std::string description,
       std::string dueDate,
       Priority priority,
       Status status,
       std::string createdAt,
       long timeSpentSeconds,
       std::string activeStartedAt = "");
  virtual ~Task() = default;

  virtual void execute(TaskExecutionContext& context, Status previousStatus) = 0;
  virtual std::string getType() const = 0;
  virtual std::shared_ptr<Task> clone() const = 0;

  const std::string& getId() const;
  const std::string& getTitle() const;
  const std::string& getDescription() const;
  const std::string& getDueDate() const;
  Priority getPriority() const;
  Status getStatus() const;
  const std::string& getCreatedAt() const;
  long getTimeSpentSeconds() const;
  const std::string& getActiveStartedAt() const;
  bool isTimerRunning() const;

  void setTitle(const std::string& value);
  void setDescription(const std::string& value);
  void setDueDate(const std::string& value);
  void setPriority(Priority value);
  void setStatus(Status value);
  void setTimeSpentSeconds(long value);
  void addTimeSpentSeconds(long value);
  void setActiveStartedAt(const std::string& value);

  virtual nlohmann::json toJson() const;
  virtual std::vector<std::string> getDependsOn() const;

  friend std::ostream& operator<<(std::ostream& os, const Task& task);

 protected:
  nlohmann::json toBaseJson() const;

 private:
  std::string id_;
  std::string title_;
  std::string description_;
  std::string dueDate_;
  Priority priority_;
  Status status_;
  std::string createdAt_;
  long timeSpentSeconds_;
  std::string activeStartedAt_;
};

std::string toString(Priority priority);
std::string toString(Status status);
Priority priorityFromString(const std::string& value);
Status statusFromString(const std::string& value);
