import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Toaster } from "sonner";

import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/ProgramDetail";
import Workshops from "./pages/Workshops";
import Resources from "./pages/Resources";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import ProfileBuilding from "./pages/ProfileBuilding";
import CareerGuidance from "./pages/CareerGuidance";
import CourseContent from "./pages/CourseContent";
import BoardsList from "./pages/curriculum/BoardsList";
import SubjectsList from "./pages/curriculum/SubjectsList";
import ChaptersList from "./pages/curriculum/ChaptersList";
import TopicsList from "./pages/curriculum/TopicsList";
import TopicPage from "./pages/curriculum/TopicPage";
import SearchPage from "./pages/curriculum/SearchPage";

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <div className="App min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/programs" element={<Programs />} />
                                <Route path="/programs/:subject" element={<ProgramDetail />} />
                                <Route path="/workshops" element={<Workshops />} />
                                <Route path="/resources" element={<Resources />} />
                                <Route path="/store" element={<Store />} />
                                <Route path="/store/cart" element={<Cart />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/profile-building" element={<ProfileBuilding />} />
                                <Route path="/career-guidance" element={<CareerGuidance />} />
                                <Route
                                    path="/course/:courseId"
                                    element={
                                        <ProtectedRoute>
                                            <CourseContent />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedRoute adminOnly>
                                            <Admin />
                                        </ProtectedRoute>
                                    }
                                />
                                {/* Curriculum Routes */}
                                <Route path="/boards" element={<BoardsList />} />
                                <Route path="/search" element={<SearchPage />} />
                                <Route path="/:board" element={<SubjectsList />} />
                                <Route path="/:board/:subject" element={<ChaptersList />} />
                                <Route path="/:board/:subject/:chapter" element={<TopicsList />} />
                                <Route path="/:board/:subject/:chapter/:topic" element={<TopicPage />} />
                            </Routes>
                        </main>
                        <Footer />
                        <WhatsAppButton />
                        <Toaster position="top-right" richColors />
                    </div>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
