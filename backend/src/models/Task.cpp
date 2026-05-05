#include "Task.h"

#include <stdexcept>

Task::Task(std::string id,
           std::string title,
           std::string description,
           std::string dueDate,
           Priority priority,
           Status status,
           std::string createdAt,
           long timeSpentSeconds,
           std::string activeStartedAt)
    : id_(std::move(id)),
      title_(std::move(title)),
      description_(std::move(description)),
      dueDate_(std::move(dueDate)),
      priority_(priority),
      status_(status),
      createdAt_(std::move(createdAt)),
      timeSpentSeconds_(timeSpentSeconds),
      activeStartedAt_(std::move(activeStartedAt)) {}

const std::string& Task::getId() const { return id_; }
const std::string& Task::getTitle() const { return title_; }
const std::string& Task::getDescription() const { return description_; }
const std::string& Task::getDueDate() const { return dueDate_; }
Priority Task::getPriority() const { return priority_; }
Status Task::getStatus() const { return status_; }
const std::string& Task::getCreatedAt() const { return createdAt_; }
long Task::getTimeSpentSeconds() const { return timeSpentSeconds_; }
const std::string& Task::getActiveStartedAt() const { return activeStartedAt_; }
bool Task::isTimerRunning() const { return !activeStartedAt_.empty(); }

void Task::setTitle(const std::string& value) { title_ = value; }
void Task::setDescription(const std::string& value) { description_ = value; }
void Task::setDueDate(const std::string& value) { dueDate_ = value; }
void Task::setPriority(Priority value) { priority_ = value; }
void Task::setStatus(Status value) { status_ = value; }
void Task::setTimeSpentSeconds(long value) { timeSpentSeconds_ = value; }
void Task::addTimeSpentSeconds(long value) { timeSpentSeconds_ += value; }
void Task::setActiveStartedAt(const std::string& value) { activeStartedAt_ = value; }

nlohmann::json Task::toBaseJson() const {
  return {
      {"id", id_},
      {"type", getType()},
      {"title", title_},
      {"description", description_},
      {"dueDate", dueDate_},
      {"priority", toString(priority_)},
      {"status", toString(status_)},
      {"createdAt", createdAt_},
      {"timeSpentSeconds", timeSpentSeconds_},
      {"isTimerRunning", isTimerRunning()},
      {"activeStartedAt", activeStartedAt_},
  };
}

nlohmann::json Task::toJson() const { return toBaseJson(); }
std::vector<std::string> Task::getDependsOn() const { return {}; }

std::string toString(Priority priority) {
  switch (priority) {
    case Priority::LOW:
      return "LOW";
    case Priority::MEDIUM:
      return "MEDIUM";
    case Priority::HIGH:
      return "HIGH";
    case Priority::URGENT:
      return "URGENT";
  }
  throw std::invalid_argument("Unknown priority");
}

std::string toString(Status status) {
  switch (status) {
    case Status::TODO:
      return "TODO";
    case Status::IN_PROGRESS:
      return "IN_PROGRESS";
    case Status::DONE:
      return "DONE";
  }
  throw std::invalid_argument("Unknown status");
}

Priority priorityFromString(const std::string& value) {
  if (value == "LOW") return Priority::LOW;
  if (value == "MEDIUM") return Priority::MEDIUM;
  if (value == "HIGH") return Priority::HIGH;
  if (value == "URGENT") return Priority::URGENT;
  throw std::invalid_argument("Invalid priority: " + value);
}

Status statusFromString(const std::string& value) {
  if (value == "TODO") return Status::TODO;
  if (value == "IN_PROGRESS") return Status::IN_PROGRESS;
  if (value == "DONE") return Status::DONE;
  throw std::invalid_argument("Invalid status: " + value);
}

std::ostream& operator<<(std::ostream& os, const Task& task) {
  const auto json = task.toJson();
  const auto csvEscape = [](const std::string& value) {
    std::string escaped = "\"";
    for (char ch : value) {
      if (ch == '"') escaped += "\"\"";
      else escaped += ch;
    }
    escaped += "\"";
    return escaped;
  };

  std::string dependsOn;
  if (json.contains("dependsOn")) {
    dependsOn = json["dependsOn"].dump();
  }

  os << csvEscape(json.value("id", ""))
     << "," << csvEscape(json.value("type", ""))
     << "," << csvEscape(json.value("title", ""))
     << "," << csvEscape(json.value("description", ""))
     << "," << csvEscape(json.value("dueDate", ""))
     << "," << csvEscape(json.value("priority", ""))
     << "," << csvEscape(json.value("status", ""))
     << "," << csvEscape(json.value("createdAt", ""))
     << "," << json.value("timeSpentSeconds", 0L)
     << "," << (json.value("isTimerRunning", false) ? "true" : "false")
     << "," << json.value("deadlineHours", 0)
     << "," << json.value("intervalDays", 0)
     << "," << csvEscape(json.value("nextOccurrence", ""))
     << "," << csvEscape(dependsOn);
  return os;
}
