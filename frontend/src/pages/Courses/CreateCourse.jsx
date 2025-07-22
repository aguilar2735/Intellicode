import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api";

export default function CreateCourse() {
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    course_code: "",
    thumbnail: null,
    modules: [],
  });

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    setCourseData((prev) => ({ ...prev, thumbnail: e.target.files[0] }));
  };

  const addModule = () => {
    setCourseData((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          title: "",
          description: "",
          order: prev.modules.length,
          lessons: [],
        },
      ],
    }));
  };

  const removeModule = (modIdx) => {
    const updatedModules = [...courseData.modules];
    updatedModules.splice(modIdx, 1);
    setCourseData({ ...courseData, modules: updatedModules });
  };

  const updateModuleField = (index, field, value) => {
    const updatedModules = [...courseData.modules];
    updatedModules[index][field] = value;
    setCourseData({ ...courseData, modules: updatedModules });
  };

  const addLesson = (modIdx) => {
    const updatedModules = [...courseData.modules];
    updatedModules[modIdx].lessons.push({
      title: "",
      content: "",
      order: updatedModules[modIdx].lessons.length,
      has_quiz: false,
      has_activity: false,
      has_code_sandbox: false,
    });
    setCourseData({ ...courseData, modules: updatedModules });
  };

  const removeLesson = (modIdx, lessonIdx) => {
    const updatedModules = [...courseData.modules];
    updatedModules[modIdx].lessons.splice(lessonIdx, 1);
    setCourseData({ ...courseData, modules: updatedModules });
  };

  const updateLessonField = (modIdx, lessonIdx, field, value) => {
    const updatedModules = [...courseData.modules];
    updatedModules[modIdx].lessons[lessonIdx][field] = value;
    setCourseData({ ...courseData, modules: updatedModules });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    const allowedFields = ["title", "description", "category", "course_code"];
    allowedFields.forEach((key) => {
      if (courseData[key]) {
        formData.append(key, courseData[key]);
      }
    });

    if (courseData.thumbnail) {
      formData.append("thumbnail", courseData.thumbnail);
    }

    // Normalize nested structure
    const normalizedModules = courseData.modules.map((mod, modIdx) => ({
      title: mod.title,
      description: mod.description,
      order: modIdx,
      lessons: mod.lessons.map((lesson, lessonIdx) => {
        const activities = [];

        if (lesson.has_quiz) {
          activities.push({
            type: "quiz",
            instructions: "This is a quiz",
            max_score: 100,
          });
        }

        if (lesson.has_activity) {
          activities.push({
            type: "activity",
            instructions: "This is an activity",
            max_score: 100,
          });
        }

        if (lesson.has_code_sandbox) {
          activities.push({
            type: "code_sandbox",
            instructions: "Code challenge",
            max_score: 100,
          });
        }

        return {
          title: lesson.title,
          content: lesson.content,
          order: lessonIdx,
          activities,
        };
      }),
    }));

    formData.append("modules", JSON.stringify(normalizedModules));

    try {
      await api.post("/api/courses/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Course created successfully!");
      navigate("/dashboard/courses");
    } catch (error) {
      console.error(
        "Error creating course:",
        error.response?.data || error.message
      );
      toast.error("Failed to create course");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-semibold text-gray-800">
        Create a New Course
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="title"
            value={courseData.title}
            onChange={handleCourseChange}
            placeholder="Course Title"
            className="p-3 border rounded w-full"
          />
          <input
            name="category"
            value={courseData.category}
            onChange={handleCourseChange}
            placeholder="Category"
            className="p-3 border rounded w-full"
          />
          <input
            name="course_code"
            value={courseData.course_code}
            onChange={handleCourseChange}
            placeholder="Course Code"
            className="p-3 border rounded w-full"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="p-2"
          />
        </div>

        <textarea
          name="description"
          value={courseData.description}
          onChange={handleCourseChange}
          placeholder="Course Description"
          className="w-full p-3 border rounded"
          rows={4}
        />

        <div>
          <button
            type="button"
            onClick={addModule}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            + Add Module
          </button>
        </div>

        {courseData.modules.map((module, modIdx) => (
          <div
            key={modIdx}
            className="p-4 bg-gray-100 rounded-lg shadow space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Module {modIdx + 1}</h3>
              <button
                type="button"
                onClick={() => removeModule(modIdx)}
                className="text-red-500 hover:underline text-sm"
              >
                Remove Module
              </button>
            </div>

            <input
              value={module.title}
              onChange={(e) =>
                updateModuleField(modIdx, "title", e.target.value)
              }
              placeholder="Module Title"
              className="w-full p-2 border rounded"
            />
            <textarea
              value={module.description}
              onChange={(e) =>
                updateModuleField(modIdx, "description", e.target.value)
              }
              placeholder="Module Description"
              className="w-full p-2 border rounded"
              rows={3}
            />

            <div>
              <button
                type="button"
                onClick={() => addLesson(modIdx)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                + Add Lesson
              </button>
            </div>

            {module.lessons.map((lesson, lessonIdx) => (
              <div
                key={lessonIdx}
                className="p-3 bg-white border rounded mt-3 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-700">
                    Lesson {lessonIdx + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeLesson(modIdx, lessonIdx)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Remove Lesson
                  </button>
                </div>
                <input
                  value={lesson.title}
                  onChange={(e) =>
                    updateLessonField(
                      modIdx,
                      lessonIdx,
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="Lesson Title"
                  className="w-full p-2 border rounded"
                />
                <textarea
                  value={lesson.content}
                  onChange={(e) =>
                    updateLessonField(
                      modIdx,
                      lessonIdx,
                      "content",
                      e.target.value
                    )
                  }
                  placeholder="Lesson Content"
                  className="w-full p-2 border rounded"
                  rows={3}
                />
                <div className="flex gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={lesson.has_quiz}
                      onChange={(e) =>
                        updateLessonField(
                          modIdx,
                          lessonIdx,
                          "has_quiz",
                          e.target.checked
                        )
                      }
                    />
                    Quiz
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={lesson.has_activity}
                      onChange={(e) =>
                        updateLessonField(
                          modIdx,
                          lessonIdx,
                          "has_activity",
                          e.target.checked
                        )
                      }
                    />
                    Activity
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={lesson.has_code_sandbox}
                      onChange={(e) =>
                        updateLessonField(
                          modIdx,
                          lessonIdx,
                          "has_code_sandbox",
                          e.target.checked
                        )
                      }
                    />
                    Code Sandbox
                  </label>
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="pt-4">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded shadow text-lg"
          >
            Create Course
          </button>
        </div>
      </form>
    </div>
  );
}
