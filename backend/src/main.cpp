#include "crow.h"

#include <sstream>

#include "manager/TaskManager.h"
#include "persistence/TaskRepository.h"
#include "routes/HttpUtils.h"

int main() {
  TaskRepository repository("tasks.db");
  repository.initialize();

  TaskManager manager;
  manager.hydrate(repository.loadTasks());

  crow::SimpleApp app;

  CROW_ROUTE(app, "/tasks").methods(crow::HTTPMethod::OPTIONS)([]() { return handleOptions(); });
  CROW_ROUTE(app, "/tasks/<string>").methods(crow::HTTPMethod::OPTIONS)([](const std::string&) { return handleOptions(); });
  CROW_ROUTE(app, "/tasks/<string>/start").methods(crow::HTTPMethod::OPTIONS)([](const std::string&) { return handleOptions(); });
  CROW_ROUTE(app, "/tasks/<string>/stop").methods(crow::HTTPMethod::OPTIONS)([](const std::string&) { return handleOptions(); });
  CROW_ROUTE(app, "/undo").methods(crow::HTTPMethod::OPTIONS)([]() { return handleOptions(); });
  CROW_ROUTE(app, "/redo").methods(crow::HTTPMethod::OPTIONS)([]() { return handleOptions(); });

  CROW_ROUTE(app, "/tasks").methods(crow::HTTPMethod::GET)([&]() {
    return guard([&]() {
      nlohmann::json tasks = nlohmann::json::array();
      for (const auto& task : manager.getTasks()) {
        tasks.push_back(task->toJson());
      }
      return jsonResponse(200, tasks);
    });
  });

  CROW_ROUTE(app, "/tasks").methods(crow::HTTPMethod::POST)([&](const crow::request& request) {
    return guard([&]() {
      const auto payload = nlohmann::json::parse(request.body);
      auto task = taskFromJson(payload);
      auto created = manager.addTask(task);
      repository.saveTasks(manager.getTasks());
      return jsonResponse(201, created->toJson());
    });
  });

  CROW_ROUTE(app, "/tasks/<string>").methods(crow::HTTPMethod::PATCH)([&](const crow::request& request, const std::string& id) {
    return guard([&]() {
      const auto payload = nlohmann::json::parse(request.body);
      auto updated = manager.updateTask(id, payload);
      repository.saveTasks(manager.getTasks());
      return jsonResponse(200, updated->toJson());
    });
  });

  CROW_ROUTE(app, "/tasks/<string>").methods(crow::HTTPMethod::DELETE)([&](const std::string& id) {
    return guard([&]() {
      manager.removeTask(id);
      repository.saveTasks(manager.getTasks());
      return textResponse(204, "", "text/plain");
    });
  });

  CROW_ROUTE(app, "/tasks/<string>/start").methods(crow::HTTPMethod::POST)([&](const std::string& id) {
    return guard([&]() {
      auto task = manager.startTaskTimer(id);
      repository.saveTasks(manager.getTasks());
      return jsonResponse(200, task->toJson());
    });
  });

  CROW_ROUTE(app, "/tasks/<string>/stop").methods(crow::HTTPMethod::POST)([&](const std::string& id) {
    return guard([&]() {
      auto task = manager.stopTaskTimer(id);
      repository.saveTasks(manager.getTasks());
      return jsonResponse(200, task->toJson());
    });
  });

  CROW_ROUTE(app, "/undo").methods(crow::HTTPMethod::POST)([&]() {
    return guard([&]() {
      auto restored = manager.undoLast();
      repository.saveTasks(manager.getTasks());
      nlohmann::json tasks = nlohmann::json::array();
      for (const auto& task : manager.getTasks()) tasks.push_back(task->toJson());
      return jsonResponse(200, {{"action", restored.action}, {"taskCount", restored.taskCount}, {"tasks", tasks}});
    });
  });

  CROW_ROUTE(app, "/redo").methods(crow::HTTPMethod::POST)([&]() {
    return guard([&]() {
      auto restored = manager.redoLast();
      repository.saveTasks(manager.getTasks());
      nlohmann::json tasks = nlohmann::json::array();
      for (const auto& task : manager.getTasks()) tasks.push_back(task->toJson());
      return jsonResponse(200, {{"action", restored.action}, {"taskCount", restored.taskCount}, {"tasks", tasks}});
    });
  });

  CROW_ROUTE(app, "/tasks/next").methods(crow::HTTPMethod::GET)([&]() {
    return guard([&]() {
      auto task = manager.getNextPriority();
      if (!task) {
        return jsonResponse(200, nlohmann::json::object());
      }
      return jsonResponse(200, task->toJson());
    });
  });

  CROW_ROUTE(app, "/tasks/order").methods(crow::HTTPMethod::GET)([&]() {
    return guard([&]() {
      nlohmann::json ordered = nlohmann::json::array();
      for (const auto& task : manager.getTopologicalOrder()) {
        ordered.push_back(task->toJson());
      }
      return jsonResponse(200, ordered);
    });
  });

  CROW_ROUTE(app, "/export").methods(crow::HTTPMethod::GET)([&]() {
    return guard([&]() {
      std::ostringstream csv;
      csv << "id,type,title,description,dueDate,priority,status,createdAt,timeSpentSeconds,isTimerRunning,deadlineHours,intervalDays,nextOccurrence,dependsOn\n";
      for (const auto& task : manager.getTasks()) {
        csv << *task << "\n";
      }
      return textResponse(200, csv.str(), "text/csv");
    });
  });

  app.port(8080).multithreaded().run();
  return 0;
}
