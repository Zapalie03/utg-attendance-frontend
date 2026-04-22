import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import '../responsive.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Edit user state
  const [editingUser, setEditingUser] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editMatriculationNumber, setEditMatriculationNumber] = useState('');

  // New course form
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [department, setDepartment] = useState('');
  const [lecturerId, setLecturerId] = useState('');

  // New user form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [matriculationNumber, setMatriculationNumber] = useState('');
  const [userDepartment, setUserDepartment] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchUsers();
  }, []);

useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.log('Error fetching courses:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await API.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.log('Error fetching users:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/courses', { courseName, courseCode, department, lecturer: lecturerId });
      setMessageType('success');
      setMessage('Course created successfully!');
      setCourseName('');
      setCourseCode('');
      setDepartment('');
      setLecturerId('');
      fetchCourses();
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Error creating course');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/register', {
        fullName, email, password, role,
        matriculationNumber, department: userDepartment
      });
      setMessageType('success');
      setMessage('User registered successfully!');
      setFullName('');
      setEmail('');
      setPassword('');
      setMatriculationNumber('');
      setUserDepartment('');
      fetchUsers();
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Error registering user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (u) => {
    setEditingUser(u._id);
    setEditFullName(u.fullName);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditDepartment(u.department);
    setEditMatriculationNumber(u.matriculationNumber || '');
  };

  const handleEditSave = async (id) => {
    try {
      await API.put(`/users/${id}`, {
        fullName: editFullName,
        email: editEmail,
        role: editRole,
        department: editDepartment,
        matriculationNumber: editMatriculationNumber
      });
      setMessageType('success');
      setMessage('User updated successfully!');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Error updating user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      setMessageType('success');
      setMessage('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Navbar */}
      <div className="navbar">
        <h2>UTG Attendance — Admin</h2>
        <div className="nav-right">
          <span>Welcome, {user?.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'courses' ? 'active-tab' : 'tab'}
          onClick={() => setActiveTab('courses')}>
          Courses
        </button>
        <button
          className={activeTab === 'users' ? 'active-tab' : 'tab'}
          onClick={() => setActiveTab('users')}>
          Users
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={messageType === 'success' ? 'message' : 'error-message'}>
          {message}
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="content">
          <h3 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '15px' }}>
            Create New Course
          </h3>
          <form onSubmit={handleCreateCourse} className="form">
            <input placeholder="Course Name" value={courseName}
              onChange={(e) => setCourseName(e.target.value)} className="input" required />
            <input placeholder="Course Code (e.g CS101)" value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)} className="input" required />
            <input placeholder="Department" value={department}
              onChange={(e) => setDepartment(e.target.value)} className="input" required />
            <select
              value={lecturerId}
              onChange={(e) => setLecturerId(e.target.value)}
              className="input"
              required>
              <option value="">Select a Lecturer</option>
              {users
                .filter(u => u.role === 'lecturer')
                .map((lecturer) => (
                  <option key={lecturer._id} value={lecturer._id}>
                    {lecturer.fullName} — {lecturer.department}
                  </option>
                ))}
            </select>
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </form>

          <h3 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '15px' }}>
            All Courses
          </h3>
          <div className="table-container">
            {courses.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center' }}>No courses found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Code</th>
                    <th>Department</th>
                    <th>Lecturer</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td>{course.courseName}</td>
                      <td>{course.courseCode}</td>
                      <td>{course.department}</td>
                      <td>{course.lecturer?.fullName || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="content">
          <h3 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '15px' }}>
            Register New User
          </h3>
          <form onSubmit={handleCreateUser} className="form">
            <input placeholder="Full Name" value={fullName}
              onChange={(e) => setFullName(e.target.value)} className="input" required />
            <input placeholder="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} className="input" required />
            <input placeholder="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} className="input" required />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
            <input placeholder="Matriculation Number (students only)"
              value={matriculationNumber}
              onChange={(e) => setMatriculationNumber(e.target.value)} className="input" />
            <input placeholder="Department" value={userDepartment}
              onChange={(e) => setUserDepartment(e.target.value)} className="input" />
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Registering...' : 'Register User'}
            </button>
          </form>

          <h3 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '15px' }}>
            All Users
          </h3>
          <div className="table-container">
            {users.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center' }}>No users found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      {editingUser === u._id ? (
                        <>
                          <td>
                            <input value={editFullName}
                              onChange={(e) => setEditFullName(e.target.value)}
                              className="input" />
                          </td>
                          <td>
                            <input value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="input" />
                          </td>
                          <td>
                            <select value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="input">
                              <option value="student">Student</option>
                              <option value="lecturer">Lecturer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <input value={editDepartment}
                              onChange={(e) => setEditDepartment(e.target.value)}
                              className="input" />
                          </td>
                          <td style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEditSave(u._id)}
                              style={{
                                backgroundColor: '#28a745',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}>
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              style={{
                                backgroundColor: '#6c757d',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}>
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{u.fullName}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td>{u.department}</td>
                          <td style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEditClick(u)}
                              style={{
                                backgroundColor: '#1a1a2e',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              style={{
                                backgroundColor: '#e74c3c',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}>
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;