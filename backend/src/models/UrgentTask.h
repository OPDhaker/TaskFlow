#pragma once

#include "Task.h"

class UrgentTask : public Task {
 public:
  UrgentTask(std::string id,
             std::string title,
             std::string description,
             std::string dueDate,
             Priority priority,
             Status status,
             std::string createdAt,
             long timeSpentSeconds,
             int deadlineHours,
             std::string activeStartedAt = "");

  void execute(TaskExecutionContext& context, Status previousStatus) override;
  std::string getType() const override;
  std::shared_ptr<Task> clone() const override;
  int getDeadlineHours() const;
  void setDeadlineHours(int value);
  nlohmann::json toJson() const override;

 private:
  int deadlineHours_;
};
