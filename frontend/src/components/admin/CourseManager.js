import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, ArrowLeft, Trash2, Edit, ChevronRight, Video, FileText, File, Eye, Upload, GripVertical } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CourseManager() {
    const [view, setView] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [modules, setModules] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState('course');
    const [editItem, setEditItem] = useState(null);
    const [uploading, setUploading] = useState(false);

    const defaultCourse = { title: '', subject: 'Mathematics', description: '', duration: '12 months', price: 45000, schedule: '', teaching_approach: '', exam_strategy: '', syllabus: '', outcomes: '', image_url: '' };
    const defaultModule = { title: '', description: '', order: 0 };
    const defaultLesson = { title: '', description: '', video_url: '', video_type: 'youtube', pdf_url: '', worksheet_url: '', is_preview: false, order: 0, duration: '' };

    const [formData, setFormData] = useState(defaultCourse);

    const fetchCourses = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/manage/courses`, { withCredentials: true });
            setCourses(res.data);
        } catch (err) { toast.error('Failed to load courses'); }
    }, []);

    const fetchModules = useCallback(async (courseId) => {
        try {
            const res = await axios.get(`${API_URL}/api/modules/by-course/${courseId}`, { withCredentials: true });
            setModules(res.data);
        } catch (err) { toast.error('Failed to load modules'); }
    }, []);

    const fetchLessons = useCallback(async (moduleId) => {
        try {
            const res = await axios.get(`${API_URL}/api/lessons/by-module/${moduleId}`, { withCredentials: true });
            setLessons(res.data);
        } catch (err) { toast.error('Failed to load lessons'); }
    }, []);

    useEffect(() => { fetchCourses(); }, [fetchCourses]);

    const openCourse = (course) => {
        setSelectedCourse(course);
        setView('modules');
        fetchModules(course.id);
    };

    const openModule = (mod) => {
        setSelectedModule(mod);
        setView('lessons');
        fetchLessons(mod.id);
    };

    const goBack = () => {
        if (view === 'lessons') { setView('modules'); setSelectedModule(null); }
        else if (view === 'modules') { setView('courses'); setSelectedCourse(null); }
    };

    const openAdd = (type) => {
        setFormType(type);
        setEditItem(null);
        if (type === 'course') setFormData(defaultCourse);
        else if (type === 'module') setFormData({ ...defaultModule, order: modules.length });
        else setFormData({ ...defaultLesson, order: lessons.length });
        setShowForm(true);
    };

    const openEdit = (type, item) => {
        setFormType(type);
        setEditItem(item);
        if (type === 'course') {
            setFormData({
                title: item.title, subject: item.subject, description: item.description,
                duration: item.duration || '', price: item.price || 0, schedule: item.schedule || '',
                teaching_approach: item.teaching_approach || '', exam_strategy: item.exam_strategy || '',
                syllabus: (item.syllabus || []).join('\n'), outcomes: (item.outcomes || []).join('\n'),
                image_url: item.image_url || ''
            });
        } else if (type === 'module') {
            setFormData({ title: item.title, description: item.description || '', order: item.order || 0 });
        } else {
            setFormData({
                title: item.title, description: item.description || '', video_url: item.video_url || '',
                video_type: item.video_type || 'youtube', pdf_url: item.pdf_url || '',
                worksheet_url: item.worksheet_url || '', is_preview: item.is_preview || false,
                order: item.order || 0, duration: item.duration || ''
            });
        }
        setShowForm(true);
    };

    const handleSave = async () => {
        try {
            if (formType === 'course') {
                const payload = {
                    ...formData, price: Number(formData.price),
                    syllabus: formData.syllabus.split('\n').filter(Boolean),
                    outcomes: formData.outcomes.split('\n').filter(Boolean),
                };
                if (editItem) {
                    await axios.put(`${API_URL}/api/admin/courses/${editItem.id}`, payload, { withCredentials: true });
                    toast.success('Course updated');
                } else {
                    await axios.post(`${API_URL}/api/admin/courses`, payload, { withCredentials: true });
                    toast.success('Course created');
                }
                fetchCourses();
            } else if (formType === 'module') {
                const payload = { ...formData, course_id: selectedCourse.id, order: Number(formData.order) };
                if (editItem) {
                    await axios.put(`${API_URL}/api/modules/${editItem.id}`, payload, { withCredentials: true });
                    toast.success('Module updated');
                } else {
                    await axios.post(`${API_URL}/api/modules`, payload, { withCredentials: true });
                    toast.success('Module created');
                }
                fetchModules(selectedCourse.id);
            } else {
                const payload = { ...formData, module_id: selectedModule.id, order: Number(formData.order) };
                if (editItem) {
                    await axios.put(`${API_URL}/api/lessons/${editItem.id}`, payload, { withCredentials: true });
                    toast.success('Lesson updated');
                } else {
                    await axios.post(`${API_URL}/api/lessons`, payload, { withCredentials: true });
                    toast.success('Lesson created');
                }
                fetchLessons(selectedModule.id);
            }
            setShowForm(false);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to save');
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Delete this ${type}?`)) return;
        try {
            if (type === 'course') {
                await axios.delete(`${API_URL}/api/admin/courses/${id}`, { withCredentials: true });
                fetchCourses();
            } else if (type === 'module') {
                await axios.delete(`${API_URL}/api/modules/${id}`, { withCredentials: true });
                fetchModules(selectedCourse.id);
            } else {
                await axios.delete(`${API_URL}/api/lessons/${id}`, { withCredentials: true });
                fetchLessons(selectedModule.id);
            }
            toast.success(`${type} deleted`);
        } catch (err) { toast.error('Failed to delete'); }
    };

    const handleFileUpload = async (e, field, uploadType) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('upload_type', uploadType);
            const res = await axios.post(`${API_URL}/api/uploads/file`, fd, {
                withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, [field]: res.data.file_url }));
            toast.success(`${file.name} uploaded`);
        } catch (err) {
            toast.error('Upload failed');
        } finally { setUploading(false); }
    };

    const Breadcrumb = () => (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6" data-testid="course-breadcrumb">
            <button onClick={() => { setView('courses'); setSelectedCourse(null); }} className="hover:text-primary font-medium">Courses</button>
            {selectedCourse && (
                <>
                    <ChevronRight className="w-4 h-4" />
                    <button onClick={() => { setView('modules'); setSelectedModule(null); }} className="hover:text-primary font-medium">{selectedCourse.title}</button>
                </>
            )}
            {selectedModule && (
                <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-primary font-medium">{selectedModule.title}</span>
                </>
            )}
        </div>
    );

    return (
        <div data-testid="course-manager">
            <Breadcrumb />

            {/* COURSES VIEW */}
            {view === 'courses' && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-primary">All Courses ({courses.length})</h3>
                        <button onClick={() => openAdd('course')} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors" data-testid="add-course-btn">
                            <Plus className="w-4 h-4" /> Add Course
                        </button>
                    </div>
                    <div className="space-y-3">
                        {courses.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow" data-testid={`course-row-${c.id}`}>
                                <button onClick={() => openCourse(c)} className="flex-1 text-left flex items-center gap-4">
                                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-primary">{c.title}</p>
                                        <p className="text-sm text-gray-500">{c.subject} · {c.module_count} modules · {c.lesson_count} lessons · ₹{c.price?.toLocaleString()}</p>
                                    </div>
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs rounded font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.is_active ? 'Active' : 'Inactive'}</span>
                                    <button onClick={() => openEdit('course', c)} className="p-2 text-gray-400 hover:text-accent rounded-lg hover:bg-gray-50"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete('course', c.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50"><Trash2 className="w-4 h-4" /></button>
                                    <ChevronRight className="w-5 h-5 text-gray-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODULES VIEW */}
            {view === 'modules' && selectedCourse && (
                <div>
                    <button onClick={goBack} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-4 text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back to Courses</button>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-primary">Modules in "{selectedCourse.title}"</h3>
                        <button onClick={() => openAdd('module')} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors" data-testid="add-module-btn">
                            <Plus className="w-4 h-4" /> Add Module
                        </button>
                    </div>
                    {modules.length === 0 ? (
                        <div className="text-center py-12 text-gray-500"><p>No modules yet. Add the first module to start building this course.</p></div>
                    ) : (
                        <div className="space-y-3">
                            {modules.map((m, i) => (
                                <div key={m.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow" data-testid={`module-row-${m.id}`}>
                                    <button onClick={() => openModule(m)} className="flex-1 text-left flex items-center gap-4">
                                        <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500">{i + 1}</span>
                                        <div>
                                            <p className="font-semibold text-primary">{m.title}</p>
                                            <p className="text-sm text-gray-500">{m.lesson_count} lessons{m.description ? ` · ${m.description}` : ''}</p>
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit('module', m)} className="p-2 text-gray-400 hover:text-accent rounded-lg hover:bg-gray-50"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete('module', m.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50"><Trash2 className="w-4 h-4" /></button>
                                        <ChevronRight className="w-5 h-5 text-gray-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* LESSONS VIEW */}
            {view === 'lessons' && selectedModule && (
                <div>
                    <button onClick={goBack} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-4 text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back to Modules</button>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-primary">Lessons in "{selectedModule.title}"</h3>
                        <button onClick={() => openAdd('lesson')} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors" data-testid="add-lesson-btn">
                            <Plus className="w-4 h-4" /> Add Lesson
                        </button>
                    </div>
                    {lessons.length === 0 ? (
                        <div className="text-center py-12 text-gray-500"><p>No lessons yet. Add the first lesson to this module.</p></div>
                    ) : (
                        <div className="space-y-3">
                            {lessons.map((l, i) => (
                                <div key={l.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-xl" data-testid={`lesson-row-${l.id}`}>
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500">{i + 1}</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-primary">{l.title}</p>
                                                {l.is_preview && <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded font-medium">Preview</span>}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                {l.video_url && <span className="flex items-center gap-1 text-xs text-gray-500"><Video className="w-3 h-3" /> Video</span>}
                                                {l.pdf_url && <span className="flex items-center gap-1 text-xs text-gray-500"><FileText className="w-3 h-3" /> PDF</span>}
                                                {l.worksheet_url && <span className="flex items-center gap-1 text-xs text-gray-500"><File className="w-3 h-3" /> Worksheet</span>}
                                                {l.duration && <span className="text-xs text-gray-400">{l.duration}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit('lesson', l)} className="p-2 text-gray-400 hover:text-accent rounded-lg hover:bg-gray-50"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete('lesson', l.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* FORM DIALOG */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editItem ? 'Edit' : 'Add'} {formType.charAt(0).toUpperCase() + formType.slice(1)}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        {/* COURSE FORM */}
                        {formType === 'course' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Title *</Label><Input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="mt-1" data-testid="course-title-input" /></div>
                                    <div><Label>Subject *</Label>
                                        <select value={formData.subject} onChange={e => setFormData(p => ({...p, subject: e.target.value}))} className="mt-1 w-full h-10 px-3 border rounded-md text-sm" data-testid="course-subject-select">
                                            {['Mathematics', 'Physics', 'Chemistry', 'Biology'].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div><Label>Description *</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} rows={3} className="mt-1" /></div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div><Label>Duration</Label><Input value={formData.duration} onChange={e => setFormData(p => ({...p, duration: e.target.value}))} className="mt-1" /></div>
                                    <div><Label>Price (₹)</Label><Input type="number" value={formData.price} onChange={e => setFormData(p => ({...p, price: e.target.value}))} className="mt-1" /></div>
                                    <div><Label>Schedule</Label><Input value={formData.schedule} onChange={e => setFormData(p => ({...p, schedule: e.target.value}))} className="mt-1" /></div>
                                </div>
                                <div><Label>Teaching Approach</Label><Textarea value={formData.teaching_approach} onChange={e => setFormData(p => ({...p, teaching_approach: e.target.value}))} rows={2} className="mt-1" /></div>
                                <div><Label>Exam Strategy</Label><Textarea value={formData.exam_strategy} onChange={e => setFormData(p => ({...p, exam_strategy: e.target.value}))} rows={2} className="mt-1" /></div>
                                <div><Label>Syllabus (one per line)</Label><Textarea value={formData.syllabus} onChange={e => setFormData(p => ({...p, syllabus: e.target.value}))} rows={3} className="mt-1" placeholder="Algebra&#10;Geometry&#10;Calculus" /></div>
                                <div><Label>Outcomes (one per line)</Label><Textarea value={formData.outcomes} onChange={e => setFormData(p => ({...p, outcomes: e.target.value}))} rows={3} className="mt-1" /></div>
                                <div><Label>Image URL</Label><Input value={formData.image_url} onChange={e => setFormData(p => ({...p, image_url: e.target.value}))} className="mt-1" placeholder="https://..." /></div>
                            </>
                        )}
                        {/* MODULE FORM */}
                        {formType === 'module' && (
                            <>
                                <div><Label>Module Title *</Label><Input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="mt-1" data-testid="module-title-input" /></div>
                                <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} rows={2} className="mt-1" /></div>
                                <div><Label>Order</Label><Input type="number" value={formData.order} onChange={e => setFormData(p => ({...p, order: e.target.value}))} className="mt-1" /></div>
                            </>
                        )}
                        {/* LESSON FORM */}
                        {formType === 'lesson' && (
                            <>
                                <div><Label>Lesson Title *</Label><Input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="mt-1" data-testid="lesson-title-input" /></div>
                                <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} rows={2} className="mt-1" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Order</Label><Input type="number" value={formData.order} onChange={e => setFormData(p => ({...p, order: e.target.value}))} className="mt-1" /></div>
                                    <div><Label>Duration</Label><Input value={formData.duration} onChange={e => setFormData(p => ({...p, duration: e.target.value}))} className="mt-1" placeholder="45 min" /></div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                    <p className="font-medium text-sm text-primary">Video</p>
                                    <div className="flex gap-3 items-end">
                                        <div className="flex-1"><Label>Video URL (YouTube/External)</Label><Input value={formData.video_url} onChange={e => setFormData(p => ({...p, video_url: e.target.value, video_type: 'youtube'}))} className="mt-1" placeholder="https://youtube.com/..." /></div>
                                    </div>
                                    <p className="text-xs text-gray-400">Or upload a video file:</p>
                                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                                        <Upload className="w-4 h-4" /> Upload Video
                                        <input type="file" accept="video/*" className="hidden" onChange={e => handleFileUpload(e, 'video_url', 'videos')} />
                                    </label>
                                    {formData.video_url && <p className="text-xs text-green-600 truncate">Set: {formData.video_url}</p>}
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                    <p className="font-medium text-sm text-primary">Materials</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>PDF</Label>
                                            <label className="mt-1 flex items-center gap-2 px-3 py-2 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 text-sm w-full">
                                                <Upload className="w-4 h-4" /> {formData.pdf_url ? 'Replace PDF' : 'Upload PDF'}
                                                <input type="file" accept=".pdf" className="hidden" onChange={e => handleFileUpload(e, 'pdf_url', 'pdfs')} />
                                            </label>
                                            {formData.pdf_url && <p className="text-xs text-green-600 mt-1 truncate">Uploaded</p>}
                                        </div>
                                        <div>
                                            <Label>Worksheet</Label>
                                            <label className="mt-1 flex items-center gap-2 px-3 py-2 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 text-sm w-full">
                                                <Upload className="w-4 h-4" /> {formData.worksheet_url ? 'Replace' : 'Upload Worksheet'}
                                                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => handleFileUpload(e, 'worksheet_url', 'worksheets')} />
                                            </label>
                                            {formData.worksheet_url && <p className="text-xs text-green-600 mt-1 truncate">Uploaded</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Switch checked={formData.is_preview} onCheckedChange={v => setFormData(p => ({...p, is_preview: v}))} data-testid="lesson-preview-toggle" />
                                    <Label>Free Preview (accessible without enrollment)</Label>
                                </div>
                            </>
                        )}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} disabled={uploading} className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50" data-testid="save-form-btn">
                                {uploading ? 'Uploading...' : (editItem ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
