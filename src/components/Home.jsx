import React from 'react';
import { useTheme } from './ThemeContext';
import { Activity, Users, Building2, Calendar, TrendingUp, Bell } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  const { isDarkMode } = useTheme();

  const stats = [
    { title: 'Total Patients', value: '1,234', change: '+12%', icon: Users, color: '#4a9eff' },
    { title: 'Total States', value: '28', change: '+0%', icon: Building2, color: '#ff9800' },
    { title: 'Total Districts', value: '718', change: '+5%', icon: Activity, color: '#4caf50' },
    { title: 'Appointments', value: '156', change: '+8%', icon: Calendar, color: '#f44336' },
  ];

  return (
    <div className={`home-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="home-header">
        <h1>Dashboard Overview</h1>
        <div className="header-stats">
          <TrendingUp size={20} />
          <span>Last 30 days</span>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
              <span className="stat-change positive">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-section">
        <div className="recent-activities">
          <h2>Recent Activities</h2>
          <div className="activity-list">
            <div className="activity-item">
              <Bell size={16} />
              <div>
                <p>New state added: California</p>
                <small>2 hours ago</small>
              </div>
            </div>
            <div className="activity-item">
              <Bell size={16} />
              <div>
                <p>District updated: Los Angeles</p>
                <small>5 hours ago</small>
              </div>
            </div>
            <div className="activity-item">
              <Bell size={16} />
              <div>
                <p>City deleted: Springfield</p>
                <small>1 day ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;