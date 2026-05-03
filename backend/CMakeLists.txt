cmake_minimum_required(VERSION 3.20)
project(task_manager_saas LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include(FetchContent)

FetchContent_Declare(
  asio
  GIT_REPOSITORY https://github.com/chriskohlhoff/asio.git
  GIT_TAG asio-1-30-2
)

FetchContent_Declare(
  crow
  GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
  GIT_TAG v1.2.1
)

FetchContent_Declare(
  json
  GIT_REPOSITORY https://github.com/nlohmann/json.git
  GIT_TAG v3.11.3
)

FetchContent_GetProperties(asio)
if(NOT asio_POPULATED)
  FetchContent_Populate(asio)
endif()

set(ASIO_INCLUDE_DIR "${asio_SOURCE_DIR}/asio/include" CACHE PATH "Standalone Asio include dir")

FetchContent_MakeAvailable(crow json)

find_package(Threads REQUIRED)
find_library(SQLITE3_LIB sqlite3 REQUIRED)

add_library(task_core
  src/models/Task.cpp
  src/models/BasicTask.cpp
  src/models/UrgentTask.cpp
  src/models/RecurringTask.cpp
  src/models/DependentTask.cpp
  src/manager/TaskManager.cpp
  src/persistence/TaskRepository.cpp
)

target_include_directories(task_core PUBLIC src)
target_link_libraries(task_core PUBLIC Crow::Crow nlohmann_json::nlohmann_json ${SQLITE3_LIB} Threads::Threads)

add_executable(task_server src/main.cpp)
target_link_libraries(task_server PRIVATE task_core)

enable_testing()
add_executable(task_manager_tests tests/task_manager_tests.cpp)
target_link_libraries(task_manager_tests PRIVATE task_core)
add_test(NAME task_manager_tests COMMAND task_manager_tests)
