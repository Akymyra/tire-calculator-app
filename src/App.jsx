import { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import FuelCalculator from "./pages/FuelCalculator";
import TireCalculator from "./pages/TireCalculator";
import PressureCalculator from "./pages/PressureCalculator";
import { Fuel, Disc, GaugeCircle } from "lucide-react";
import { HelmetProvider } from "react-helmet-async"; // ✅ добавлено
import SEO from "./components/SEO"; // ✅ импортируем наш SEO-компонент

export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [fadeStage, setFadeStage] = useState("fade-in");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeStage("visible"), 200);
    const t2 = setTimeout(() => setFadeStage("fade-out"), 2200);
    const t3 = setTimeout(() => {
      setAppLoading(false);
      setTimeout(() => setShowMenu(true), 200);
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Splash screen
  if (appLoading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen transition-opacity duration-1000 ${
          fadeStage === "fade-in"
            ? "opacity-0"
            : fadeStage === "visible"
            ? "opacity-100"
            : "opacity-0"
        }`}
        style={{
          backgroundImage: "url('/fon.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <img
          src="/logo.svg"
          alt="Логотип"
          className="w-[500px] sm:w-[600px] h-auto"
        />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <div
        className="min-h-screen flex items-center justify-center text-white"
        style={{
          backgroundImage: "url('/fon.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <main className="w-full max-w-4xl px-4">
          <Routes>
            {/* Главное меню */}
            <Route
              path="/"
              element={
                <>
                  {/* ✅ SEO для главной страницы */}
                  <SEO
                    title="Онлайн калькуляторы для водителей — шины, давление, топливо"
                    description="Бесплатные онлайн-калькуляторы для автомобилистов: расчет и подбор шин, проверка давления в колесах, калькулятор экономии топлива. Удобно и точно."
                    keywords="калькулятор шин, онлайн калькулятор шин, давление в шинах калькулятор, калькулятор экономии топлива, tire calculator, tire size calculator"
                  />

                  <div
                    className={`text-center space-y-10 transition-all duration-1000 ${
                      showMenu ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                  >
                    {/* Логотип */}
                    <div className="flex justify-center">
                      <img
                        src="/logo.svg"
                        alt="Логотип"
                        className="w-full max-w-[375px] h-auto"
                      />
                    </div>

                    {/* Заголовок */}
                    <div>
                      <h1
                        className="text-2xl sm:text-3xl font-bold mb-4"
                        style={{ color: "#028cff" }}
                      >
                        Онлайн-калькуляторы
                      </h1>
                      <p
                        className="max-w-2xl mx-auto text-base sm:text-lg"
                        style={{ color: "#028cff" }}
                      >
                        Выберите калькулятор, чтобы рассчитать{" "}
                        <b>экономию топлива</b>, подобрать <b>шины</b> или
                        проверить <b>давление</b>.
                      </p>
                    </div>

                    {/* Кнопки калькуляторов */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-3xl mx-auto">
                      <Link
                        to="/fuel"
                        className="p-7 rounded-2xl bg-gray-700/70 hover:bg-gray-600/80 shadow-lg border border-transparent hover:border-blue-400 hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 flex flex-col items-center"
                      >
                        <Fuel
                          size={50}
                          className="mb-4 drop-shadow-[0_0_8px_rgba(2,140,255,0.7)]"
                          style={{ color: "#028cff" }}
                        />
                        <span
                          className="text-lg font-semibold"
                          style={{ color: "#028cff" }}
                        >
                          Калькулятор топлива
                        </span>
                      </Link>

                      <Link
                        to="/tire"
                        className="p-7 rounded-2xl bg-gray-700/70 hover:bg-gray-600/80 shadow-lg border border-transparent hover:border-blue-400 hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 flex flex-col items-center"
                      >
                        <Disc
                          size={50}
                          className="mb-4 drop-shadow-[0_0_8px_rgba(2,140,255,0.7)]"
                          style={{ color: "#028cff" }}
                        />
                        <span
                          className="text-lg font-semibold"
                          style={{ color: "#028cff" }}
                        >
                          Калькулятор шин
                        </span>
                      </Link>

                      <Link
                        to="/pressure"
                        className="p-7 rounded-2xl bg-gray-700/70 hover:bg-gray-600/80 shadow-lg border border-transparent hover:border-blue-400 hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 flex flex-col items-center"
                      >
                        <GaugeCircle
                          size={50}
                          className="mb-4 drop-shadow-[0_0_8px_rgba(2,140,255,0.7)]"
                          style={{ color: "#028cff" }}
                        />
                        <span
                          className="text-lg font-semibold"
                          style={{ color: "#028cff" }}
                        >
                          Калькулятор давления
                        </span>
                      </Link>
                    </div>
                      {/* Контакты */}
                      <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                        <a
                          href="https://t.me/igra_protektorov"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-transform transform hover:scale-105 text-center"
                        >
                          📢 Telegram: Игра Протекторов
                        </a>
                        <a
                          href="tel:+79020682525"
                          className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-transform transform hover:scale-105 text-center"
                        >
                          📞 Позвонить: 8 (902) 068-25-25
                        </a>
                      </div>
                  </div>
                </>
              }
            />

            {/* Калькуляторы */}
            <Route path="/fuel" element={<FuelCalculator />} />
            <Route path="/tire" element={<TireCalculator />} />
            <Route path="/pressure" element={<PressureCalculator />} />

            {/* Любой другой путь → редирект на меню */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HelmetProvider>
  );
}















