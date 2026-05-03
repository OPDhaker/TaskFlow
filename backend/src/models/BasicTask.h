#pragma once

#include "Task.h"

class BasicTask : public Task {
 public:
  using Task::Task;

  void execute(TaskExecutionContext& context, Status previousStatus) override;
  std::string getType() const override;
  std::shared_ptr<Task> clone() const override;
};
