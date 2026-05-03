#pragma once

#include "Task.h"

class DependentTask : public Task {
 public:
  DependentTask(std::string id,
                std::string title,
                std::string description,
                std::string dueDate,
                Priority priority,
                Status status,
                std::string createdAt,
                long timeSpentSeconds,
                std::vector<std::string> dependsOn,
                std::string activeStartedAt = "");

  void execute(TaskExecutionContext& context, Status previousStatus) override;
  std::string getType() const override;
  std::shared_ptr<Task> clone() const override;
  std::vector<std::string> getDependsOn() const override;
  void setDependsOn(std::vector<std::string> dependsOn);
  nlohmann::json toJson() const override;

 private:
  std::vector<std::string> dependsOn_;
};
