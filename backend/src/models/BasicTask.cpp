#include "BasicTask.h"

void BasicTask::execute(TaskExecutionContext&, Status) {}
std::string BasicTask::getType() const { return "basic"; }
std::shared_ptr<Task> BasicTask::clone() const { return std::make_shared<BasicTask>(*this); }
