// src/pages/EditCourse.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-hot-toast";

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/api/courses/${courseId}/`);
        const course = res.data;

        const normalizedModules = Array.isArray(course.modules)
          ? course.modules.map((module) => ({
              ...module,
              lessons: Array.isArray(module.lessons)
                ? module.lessons.map((lesson) => ({
                    ...lesson,
                    activities: Array.isArray(lesson.activities)
                      ? lesson.activities.map((activity) => ({
                          id: activity.id,
                          type: activity.type,
                          content: activity.content,
                        }))
                      : [],
                  }))
                : [],
            }))
          : [];

        setCourseData({
          ...course,
          modules: normalizedModules,
        });
      } catch (err) {
        toast.error("Failed to load course.");
        navigate("/dashboard/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleAddModule = () => {
    setCourseData({
      ...courseData,
      modules: [...courseData.modules, { title: "", lessons: [] }],
    });
  };

  const handleRemoveModule = (index) => {
    const updatedModules = [...courseData.modules];
    updatedModules.splice(index, 1);
    setCourseData({ ...courseData, modules: updatedModules });
  };

  const handleModuleTitleChange = (index, value) => {
    const updatedModules = [...courseData.modules];
    updatedModules[index].title = value;
    setCourseData({ ...courseData, modules: updatedModules });
  };

  const handleAddLesson = (moduleIndex) => {
    const updatedModules = [...courseData.modules];
    updatedModules[moduleIndex].lessons.push({ title: "", activities: [] });
    setCourseData({ ...courseData, modules: updatedModules });
  };

  const handleRemoveLesson = (moduleIndex, lessonIndex) => {
    const updatedModules = [...courseData.modules];
    updatedModules[moduleIndex].lessons.splice(lessonIndex, 1);
    setCourseData({ ...courseData, modules: updatedModules });
  };

  const handleLessonTitleChange = (moduleIndex, lessonIndex, value) => {
    const updatedModules = [...courseData.modules];
    updatedModules[moduleIndex].lessons[lessonIndex].title = value;
    setCourseData({ ...courseData, modules: updatedModules });
  };

  const handleAddActivity = (moduleIndex, lessonIndex) => {
    const updatedModules = [...courseData.modules];
    updatedModules[moduleIndex].lessons[lessonIndex].activities.push({
      title: "",
      activity_type: "quiz",
      instructions: "",
      max_score: 100,
      due_date: "",
    });
    setCourseData({ ...courseData, modules: updatedModules });
  };

  const handleRemoveActivity = (moduleIndex, lessonIndex, activityIndex) => {
    const updatedModules = [...courseData.modules];
    updatedModules[moduleIndex].lessons[lessonIndex].activities.splice(
      activityIndex,
      1
    );
    setCourseData({ ...courseData, modules: updatedModules });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Save Changes clicked"); // <- This should appear!  

    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("course_code", courseData.course_code);
    formData.append("category", courseData.category);
    formData.append("description", courseData.description || "");

    if (courseData.thumbnail instanceof File) {
      formData.append("thumbnail", courseData.thumbnail);
    }

    // Normalize and ensure correct keys are sent
    const normalizedModules = (courseData.modules || []).map((mod) => ({
      id: mod.id,
      title: mod.title,
      description: mod.description,
      lessons: (mod.lessons || []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        activities: (lesson.activities || []).map((activity) => ({
          id: activity.id,
          title: activity.title,
          activity_type: activity.activity_type,
          instructions: activity.instructions,
          max_score: activity.max_score,
          due_date: activity.due_date,
        })),
      })),
    }));

    formData.append("modules", JSON.stringify(normalizedModules));

    try {
      await api.put(`/api/courses/${courseId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Course updated!");
      navigate("/dashboard/courses");
    } catch (err) {
      console.error("Update failed", err.response?.data || err.message);
      toast.error("Failed to update course.");
    }
  };

  if (loading || !courseData) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading course data...
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Course</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium">Course Title</label>
          <input
            type="text"
            name="title"
            value={courseData.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block font-medium">Course Code</label>
          <input
            type="text"
            name="course_code"
            value={courseData.course_code}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block font-medium">Category</label>
          <input
            type="text"
            name="category"
            value={courseData.category}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={courseData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
            rows={4}
          />
        </div>

        <div>
          <label className="block font-medium">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setCourseData({ ...courseData, thumbnail: e.target.files[0] })
            }
            className="mt-1"
          />
        </div>

        {/* Modules Section */}
        <div>
          <h2 className="text-lg font-semibold mt-8 mb-4">Modules</h2>
          {Array.isArray(courseData.modules) &&
            courseData.modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="border p-4 rounded mb-4">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) =>
                      handleModuleTitleChange(moduleIndex, e.target.value)
                    }
                    placeholder="Module title"
                    className="w-full border px-3 py-2 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveModule(moduleIndex)}
                    className="ml-4 text-red-600"
                  >
                    Remove Module
                  </button>
                </div>

                {/* Lessons */}
                <div className="mt-4">
                  {Array.isArray(module.lessons) &&
                    module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="border p-3 rounded mb-2 bg-gray-50"
                      >
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) =>
                            handleLessonTitleChange(
                              moduleIndex,
                              lessonIndex,
                              e.target.value
                            )
                          }
                          placeholder="Lesson title"
                          className="w-full border px-3 py-2 rounded mb-2"
                        />
                        <textarea
                          value={lesson.content || ""}
                          onChange={(e) => {
                            const updatedModules = [...courseData.modules];
                            updatedModules[moduleIndex].lessons[
                              lessonIndex
                            ].content = e.target.value;
                            setCourseData({
                              ...courseData,
                              modules: updatedModules,
                            });
                          }}
                          placeholder="Lesson content"
                          className="w-full border px-3 py-2 rounded mb-2"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveLesson(moduleIndex, lessonIndex)
                          }
                          className="mt-2 text-red-500 text-sm"
                        >
                          Remove Lesson
                        </button>

                        {/* Activities */}
                        <div className="ml-4 mt-3">
                          {Array.isArray(lesson.activities) &&
                            lesson.activities.map((activity, activityIndex) => (
                              <div
                                key={activityIndex}
                                className="flex justify-between items-center bg-white px-3 py-2 rounded border mb-2"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                                  <input
                                    type="text"
                                    value={activity.title || ""}
                                    onChange={(e) => {
                                      const updatedModules = [
                                        ...courseData.modules,
                                      ];
                                      updatedModules[moduleIndex].lessons[
                                        lessonIndex
                                      ].activities[activityIndex].title =
                                        e.target.value;
                                      setCourseData({
                                        ...courseData,
                                        modules: updatedModules,
                                      });
                                    }}
                                    placeholder="Activity title"
                                    className="border px-3 py-2 rounded"
                                  />
                                  <select
                                    value={activity.activity_type || "quiz"}
                                    onChange={(e) => {
                                      const updatedModules = [
                                        ...courseData.modules,
                                      ];
                                      updatedModules[moduleIndex].lessons[
                                        lessonIndex
                                      ].activities[
                                        activityIndex
                                      ].activity_type = e.target.value;
                                      setCourseData({
                                        ...courseData,
                                        modules: updatedModules,
                                      });
                                    }}
                                    className="border px-3 py-2 rounded"
                                  >
                                    <option value="quiz">Quiz</option>
                                    <option value="code">Code</option>
                                    <option value="discussion">
                                      Discussion
                                    </option>
                                    {/* Add more types if needed */}
                                  </select>
                                  <input
                                    type="number"
                                    value={activity.max_score || 100}
                                    onChange={(e) => {
                                      const updatedModules = [
                                        ...courseData.modules,
                                      ];
                                      updatedModules[moduleIndex].lessons[
                                        lessonIndex
                                      ].activities[activityIndex].max_score =
                                        parseInt(e.target.value) || 0;
                                      setCourseData({
                                        ...courseData,
                                        modules: updatedModules,
                                      });
                                    }}
                                    placeholder="Max Score"
                                    className="border px-3 py-2 rounded"
                                  />
                                  <input
                                    type="date"
                                    value={activity.due_date || ""}
                                    onChange={(e) => {
                                      const updatedModules = [
                                        ...courseData.modules,
                                      ];
                                      updatedModules[moduleIndex].lessons[
                                        lessonIndex
                                      ].activities[activityIndex].due_date =
                                        e.target.value;
                                      setCourseData({
                                        ...courseData,
                                        modules: updatedModules,
                                      });
                                    }}
                                    className="border px-3 py-2 rounded"
                                  />
                                  <textarea
                                    value={activity.instructions || ""}
                                    onChange={(e) => {
                                      const updatedModules = [
                                        ...courseData.modules,
                                      ];
                                      updatedModules[moduleIndex].lessons[
                                        lessonIndex
                                      ].activities[activityIndex].instructions =
                                        e.target.value;
                                      setCourseData({
                                        ...courseData,
                                        modules: updatedModules,
                                      });
                                    }}
                                    placeholder="Instructions"
                                    className="col-span-full border px-3 py-2 rounded"
                                    rows={2}
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveActivity(
                                      moduleIndex,
                                      lessonIndex,
                                      activityIndex
                                    )
                                  }
                                  className="text-sm text-red-500"
                                >
                                  Remove Activity
                                </button>
                              </div>
                            ))}
                          <button
                            type="button"
                            onClick={() =>
                              handleAddActivity(moduleIndex, lessonIndex)
                            }
                            className="text-sm text-blue-600 mt-2"
                          >
                            + Add Activity
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddLesson(moduleIndex)}
                  className="mt-3 text-sm text-blue-600"
                >
                  + Add Lesson
                </button>
              </div>
            ))}

          <button
            type="button"
            onClick={handleAddModule}
            className="mt-2 text-blue-700"
          >
            + Add Module
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded shadow mt-6"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditCourse;
