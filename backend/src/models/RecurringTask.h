#pragma once

#include "Task.h"

class RecurringTask : public Task {
 public:
  RecurringTask(std::string id,
                std::string title,
                std::string description,
                std::string dueDate,
                Priority priority,
                Status status,
                std::string createdAt,
                long timeSpentSeconds,
                int intervalDays,
                std::string nextOccurrence,
                std::string activeStartedAt = "");

  void execute(TaskExecutionContext& context, Status previousStatus) override;
  std::string getType() const override;
  std::shared_ptr<Task> clone() const override;
  int getIntervalDays() const;
  const std::string& getNextOccurrence() const;
  void setIntervalDays(int value);
  nlohmann::json toJson() const override;

 private:
  int intervalDays_;
  std::string nextOccurrence_;
};
