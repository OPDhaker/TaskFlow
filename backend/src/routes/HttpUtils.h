#pragma once

#include "crow.h"

#include <functional>
#include <stdexcept>

inline crow::response jsonResponse(int code, const nlohmann::json& body) {
  crow::response response(code, body.dump());
  response.set_header("Content-Type", "application/json");
  response.set_header("Access-Control-Allow-Origin", "*");
  response.set_header("Access-Control-Allow-Headers", "Content-Type");
  response.set_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  return response;
}

inline crow::response textResponse(int code, const std::string& body, const std::string& contentType) {
  crow::response response(code, body);
  response.set_header("Content-Type", contentType);
  response.set_header("Access-Control-Allow-Origin", "*");
  response.set_header("Access-Control-Allow-Headers", "Content-Type");
  response.set_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  return response;
}

inline crow::response handleOptions() {
  return textResponse(204, "", "text/plain");
}

template <typename Callback>
crow::response guard(Callback&& callback) {
  try {
    return callback();
  } catch (const std::invalid_argument& error) {
    return jsonResponse(400, {{"error", error.what()}});
  } catch (const std::out_of_range& error) {
    return jsonResponse(404, {{"error", error.what()}});
  } catch (const std::logic_error& error) {
    return jsonResponse(409, {{"error", error.what()}});
  } catch (const std::exception& error) {
    return jsonResponse(500, {{"error", error.what()}});
  }
}
