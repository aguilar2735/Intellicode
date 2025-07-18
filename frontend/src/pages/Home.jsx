const Home = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-600 mb-4">
        Welcome to IntelliCode
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-6">
        A smart platform for student submissions and instructor grading.
      </p>
      <div className="flex space-x-4">
        <a href="/login" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
          Login
        </a>
        <a href="/register" className="border border-indigo-600 text-indigo-600 px-6 py-2 rounded hover:bg-indigo-50">
          Register
        </a>
      </div>
    </div>
  );
};

export default Home;
