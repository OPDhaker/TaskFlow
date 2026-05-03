#include "RecurringTask.h"

#include "../utils/TimeUtils.h"

RecurringTask::RecurringTask(std::string id,
                             std::string title,
                             std::string description,
                             std::string dueDate,
                             Priority priority,
                             Status status,
                             std::string createdAt,
                             long timeSpentSeconds,
                             int intervalDays,
                             std::string nextOccurrence,
                             std::string activeStartedAt)
    : Task(std::move(id),
           std::move(title),
           std::move(description),
           std::move(dueDate),
           priority,
           status,
           std::move(createdAt),
           timeSpentSeconds,
           std::move(activeStartedAt)),
      intervalDays_(intervalDays),
      nextOccurrence_(std::move(nextOccurrence)) {}

void RecurringTask::execute(TaskExecutionContext& context, Status previousStatus) {
  if (getStatus() == Status::DONE && previousStatus != Status::DONE) {
    nextOccurrence_ = time_utils::addDaysUtcIso(context.nowUtc(), intervalDays_);
  }
}

std::string RecurringTask::getType() const { return "recurring"; }
std::shared_ptr<Task> RecurringTask::clone() const { return std::make_shared<RecurringTask>(*this); }
int RecurringTask::getIntervalDays() const { return intervalDays_; }
const std::string& RecurringTask::getNextOccurrence() const { return nextOccurrence_; }
void RecurringTask::setIntervalDays(int value) { intervalDays_ = value; }
nlohmann::json RecurringTask::toJson() const {
  auto json = toBaseJson();
  json["intervalDays"] = intervalDays_;
  json["nextOccurrence"] = nextOccurrence_;
  return json;
}
