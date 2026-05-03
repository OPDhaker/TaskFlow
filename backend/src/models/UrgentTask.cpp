#include "UrgentTask.h"

UrgentTask::UrgentTask(std::string id,
                       std::string title,
                       std::string description,
                       std::string dueDate,
                       Priority priority,
                       Status status,
                       std::string createdAt,
                       long timeSpentSeconds,
                       int deadlineHours,
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
      deadlineHours_(deadlineHours) {}

void UrgentTask::execute(TaskExecutionContext&, Status) { setPriority(Priority::URGENT); }
std::string UrgentTask::getType() const { return "urgent"; }
std::shared_ptr<Task> UrgentTask::clone() const { return std::make_shared<UrgentTask>(*this); }
int UrgentTask::getDeadlineHours() const { return deadlineHours_; }
void UrgentTask::setDeadlineHours(int value) { deadlineHours_ = value; }
nlohmann::json UrgentTask::toJson() const {
  auto json = toBaseJson();
  json["deadlineHours"] = deadlineHours_;
  return json;
}
