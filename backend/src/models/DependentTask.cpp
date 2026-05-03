#include "DependentTask.h"

#include <stdexcept>

DependentTask::DependentTask(std::string id,
                             std::string title,
                             std::string description,
                             std::string dueDate,
                             Priority priority,
                             Status status,
                             std::string createdAt,
                             long timeSpentSeconds,
                             std::vector<std::string> dependsOn,
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
      dependsOn_(std::move(dependsOn)) {}

void DependentTask::execute(TaskExecutionContext& context, Status previousStatus) {
  if (getStatus() != previousStatus && getStatus() != Status::TODO && !context.areTasksDone(dependsOn_)) {
    throw std::logic_error("Dependent task cannot change status until all dependencies are DONE");
  }
}

std::string DependentTask::getType() const { return "dependent"; }
std::shared_ptr<Task> DependentTask::clone() const { return std::make_shared<DependentTask>(*this); }
std::vector<std::string> DependentTask::getDependsOn() const { return dependsOn_; }
void DependentTask::setDependsOn(std::vector<std::string> dependsOn) { dependsOn_ = std::move(dependsOn); }
nlohmann::json DependentTask::toJson() const {
  auto json = toBaseJson();
  json["dependsOn"] = dependsOn_;
  return json;
}
