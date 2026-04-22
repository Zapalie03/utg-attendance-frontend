import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../responsive.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState('scan');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  useEffect(() => {
    if (activeTab === 'scan' && scanning) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, scanning]);

  const fetchMyAttendance = async () => {
    try {
      const response = await API.get('/attendance/my-attendance');
      setAttendance(response.data.attendance);
    } catch (error) {
      console.log('Error fetching attendance:', error);
    }
  };

  const startScanner = () => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      facingMode: "environment"
    });
    scanner.render(
      async (decodedText) => {
        scanner.clear();
        scannerRef.current = null;
        setScanning(false);

        try {
          const qrData = JSON.parse(decodedText);
          const response = await API.post('/attendance', {
            sessionId: qrData.sessionId,
            courseId: qrData.courseId
          });

          setMessageType('success');
          setMessage(response.data.message);
          fetchMyAttendance();
        } catch (error) {
          setMessageType('error');
          setMessage(error.response?.data?.message || 'Error marking attendance');
        }
      },
      (error) => {
        console.log('QR scan error:', error);
      }
    );

    scannerRef.current = scanner;
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  const handleStartScan = () => {
    setMessage('');
    setScanning(true);
    setTimeout(() => startScanner(), 100);
  };

  const handleStopScan = () => {
    stopScanner();
    setScanning(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Navbar */}
      <div className="navbar">
        <h2>UTG Attendance — Student</h2>
        <div className="nav-right">
          <span>Welcome, {user?.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'scan' ? 'active-tab' : 'tab'}
          onClick={() => { setActiveTab('scan'); handleStopScan(); }}>
          Scan QR Code
        </button>
        <button
          className={activeTab === 'attendance' ? 'active-tab' : 'tab'}
          onClick={() => { setActiveTab('attendance'); handleStopScan(); }}>
          My Attendance
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={messageType === 'success' ? 'message' : 'error-message'}>
          {message}
        </div>
      )}

      {/* Scan Tab */}
      {activeTab === 'scan' && (
        <div className="content">
          <h3 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '10px' }}>
            Scan QR Code to Mark Attendance
          </h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            Ask your lecturer to display the QR code, then click the button below to scan it.
          </p>

          <div className="scanner-container">
            {scanning ? (
              <>
                <div id="qr-reader"></div>
                <button onClick={handleStopScan} className="stop-button">
                  Stop Scanning
                </button>
              </>
            ) : (
              <button onClick={handleStartScan} className="scan-button">
                📷 Start Scanning
              </button>
            )}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="content">
          <h3 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '10px' }}>
            My Attendance Record
          </h3>
          <p style={{ fontSize: '15px', color: '#333', marginBottom: '15px' }}>
            Total Classes Attended: <strong>{attendance.length}</strong>
          </p>
          <div className="table-container">
            {attendance.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center' }}>No attendance records found</p>
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
                  {attendance.map((record) => (
                    <tr key={record._id}>
                      <td>{record.course?.courseName || 'N/A'}</td>
                      <td>{new Date(record.session?.date).toLocaleDateString()}</td>
                      <td>{record.session?.startTime || 'N/A'}</td>
                      <td>{record.session?.endTime || 'N/A'}</td>
                      <td>
                        <span style={{
                          backgroundColor: '#d4edda',
                          color: '#155724',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          Present
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

export default StudentDashboard;