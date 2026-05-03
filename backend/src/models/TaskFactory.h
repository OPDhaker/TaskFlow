#pragma once

#include <memory>

#include "BasicTask.h"
#include "DependentTask.h"
#include "RecurringTask.h"
#include "UrgentTask.h"
#include "../utils/TimeUtils.h"

inline std::shared_ptr<Task> taskFromJson(const nlohmann::json& json,
                                          const std::string& generatedId = "",
                                          const std::string& generatedCreatedAt = "") {
  const auto type = json.at("type").get<std::string>();
  const auto id = json.value("id", generatedId.empty() ? time_utils::generateId() : generatedId);
  const auto createdAt = json.value("createdAt", generatedCreatedAt.empty() ? time_utils::nowUtcIso() : generatedCreatedAt);
  const auto title = json.at("title").get<std::string>();
  const auto description = json.value("description", "");
  const auto dueDate = json.at("dueDate").get<std::string>();
  time_utils::parseUtc(dueDate);
  time_utils::parseUtc(createdAt);
  const auto priority = priorityFromString(json.value("priority", "MEDIUM"));
  const auto status = statusFromString(json.value("status", "TODO"));
  const auto timeSpentSeconds = json.value("timeSpentSeconds", 0L);
  const auto activeStartedAt = json.value("activeStartedAt", "");

  if (type == "basic") {
    return std::make_shared<BasicTask>(id, title, description, dueDate, priority, status, createdAt, timeSpentSeconds, activeStartedAt);
  }
  if (type == "urgent") {
    return std::make_shared<UrgentTask>(id, title, description, dueDate, priority, status, createdAt, timeSpentSeconds, json.at("deadlineHours").get<int>(), activeStartedAt);
  }
  if (type == "recurring") {
    return std::make_shared<RecurringTask>(id, title, description, dueDate, priority, status, createdAt, timeSpentSeconds, json.at("intervalDays").get<int>(), json.value("nextOccurrence", ""), activeStartedAt);
  }
  if (type == "dependent") {
    return std::make_shared<DependentTask>(id, title, description, dueDate, priority, status, createdAt, timeSpentSeconds, json.value("dependsOn", std::vector<std::string> {}), activeStartedAt);
  }
  throw std::runtime_error("Unsupported task type: " + type);
}
