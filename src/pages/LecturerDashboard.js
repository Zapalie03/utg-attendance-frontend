import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import '../responsive.css';

const LecturerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [courseId, setCourseId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [activeQR, setActiveQR] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchSessions();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.log('Error fetching courses:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await API.get('/sessions/my-sessions');
      setSessions(response.data);
    } catch (error) {
      console.log('Error fetching sessions:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await API.post('/sessions', {
        course: courseId,
        startTime,
        endTime
      });

      const { session } = response.data;
      setActiveQR(session.qrCode);
      setActiveSession(session);
      setMessage('Session created! QR code is active for 5 minutes!');
      fetchSessions();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Navbar */}
      <div className="navbar">
        <h2>UTG Attendance — Lecturer</h2>
        <div className="nav-right">
          <span>Welcome, {user?.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'create' ? 'active-tab' : 'tab'}
          onClick={() => setActiveTab('create')}>
          Create Session
        </button>
        <button
          className={activeTab === 'sessions' ? 'active-tab' : 'tab'}
          onClick={() => setActiveTab('sessions')}>
          My Sessions
        </button>
      </div>

      {/* Message */}
      {message && <div className="message">{message}</div>}

      {/* Create Session Tab */}
      {activeTab === 'create' && (
        <div className="content">
          <h3 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '15px' }}>
            Create New Session
          </h3>
          <form onSubmit={handleCreateSession} className="form">
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="input"
              required>
              <option value="">Select a Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseName} ({course.courseCode})
                </option>
              ))}
            </select>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input"
              required />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input"
              required />
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Creating...' : 'Create Session & Generate QR'}
            </button>
          </form>

          {/* QR Code Display */}
          {activeQR && (
            <div className="qr-container">
              <h3 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '10px' }}>
                Active QR Code
              </h3>
              <p className="qr-warning">⏰ This QR code expires in 5 minutes!</p>
              <div className="qr-wrapper">
                <QRCode
                  value={JSON.stringify({
                    sessionId: activeSession.id,
                    courseId: activeSession.course
                  })}
                  size={220}
                  level="H"
                />
              </div>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Show this QR code to your students to mark attendance
              </p>
            </div>
          )}
        </div>
      )}

      {/* My Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="content">
          <h3 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '15px' }}>
            My Sessions
          </h3>
          <div className="table-container">
            {sessions.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center' }}>No sessions found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Date</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session._id}>
                      <td>{session.course?.courseName || 'N/A'}</td>
                      <td>{new Date(session.date).toLocaleDateString()}</td>
                      <td>{session.startTime}</td>
                      <td>{session.endTime}</td>
                      <td>
                        <span style={{
                          backgroundColor: session.isActive ? '#d4edda' : '#f8d7da',
                          color: session.isActive ? '#155724' : '#721c24',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {session.isActive ? 'Active' : 'Closed'}
                        </span>
                      </td>
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

export default LecturerDashboard;