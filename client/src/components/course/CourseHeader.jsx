export default function CourseHeader({ course }) {
    return (
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-12 px-6">
            <div className="max-w-[1920px] mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                    {course.title}
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-4">
                    {course.subtitle}
                </p>
                <p className="text-base md:text-lg text-blue-50 max-w-3xl">
                    {course.description}
                </p>
            </div>
        </div>
    );
}

