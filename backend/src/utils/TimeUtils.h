#pragma once

#include <chrono>
#include <ctime>
#include <iomanip>
#include <random>
#include <sstream>
#include <stdexcept>
#include <string>

namespace time_utils {

inline std::string formatUtc(const std::chrono::system_clock::time_point& timePoint) {
  std::time_t raw = std::chrono::system_clock::to_time_t(timePoint);
  std::tm tm {};
#if defined(_WIN32)
  gmtime_s(&tm, &raw);
#else
  gmtime_r(&raw, &tm);
#endif
  std::ostringstream stream;
  stream << std::put_time(&tm, "%Y-%m-%dT%H:%M:%SZ");
  return stream.str();
}

inline std::chrono::system_clock::time_point parseUtc(const std::string& value) {
  std::tm tm {};
  std::istringstream stream(value);
  stream >> std::get_time(&tm, "%Y-%m-%dT%H:%M:%SZ");
  if (stream.fail()) {
    throw std::runtime_error("Invalid UTC timestamp: " + value);
  }
#if defined(_WIN32)
  return std::chrono::system_clock::from_time_t(_mkgmtime(&tm));
#else
  return std::chrono::system_clock::from_time_t(timegm(&tm));
#endif
}

inline std::string nowUtcIso() {
  return formatUtc(std::chrono::system_clock::now());
}

inline std::string addDaysUtcIso(const std::string& baseIso, int days) {
  auto base = parseUtc(baseIso);
  auto adjusted = base + std::chrono::hours(days * 24);
  return formatUtc(adjusted);
}

inline long elapsedSeconds(const std::string& startedAtIso, const std::string& stoppedAtIso) {
  const auto started = parseUtc(startedAtIso);
  const auto stopped = parseUtc(stoppedAtIso);
  const auto diff = std::chrono::duration_cast<std::chrono::seconds>(stopped - started).count();
  return diff < 0 ? 0 : diff;
}

inline std::string generateId() {
  static std::mt19937_64 engine(std::random_device {}());
  static std::uniform_int_distribution<unsigned long long> dist;
  std::ostringstream stream;
  stream << std::hex << dist(engine) << dist(engine);
  return stream.str();
}

}  // namespace time_utils
