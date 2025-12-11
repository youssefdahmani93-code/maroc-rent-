
import React, { useState } from 'react';
import { 
  X, Bell, CheckCheck, Trash2, 
  Car, Wrench, Calendar, User, MapPin, FileText,
  AlertTriangle, Info, AlertCircle, CheckCircle
} from 'lucide-react';
import { AppNotification, NotificationCategory, NotificationPriority } from '../types';
import { MOCK_NOTIFICATIONS } from '../constants';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, onNavigate }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (category: NotificationCategory) => {
    switch (category) {
      case NotificationCategory.VEHICLE: return <Car className="h-5 w-5" />;
      case NotificationCategory.MAINTENANCE: return <Wrench className="h-5 w-5" />;
      case NotificationCategory.RESERVATION: return <Calendar className="h-5 w-5" />;
      case NotificationCategory.CLIENT: return <User className="h-5 w-5" />;
      case NotificationCategory.GPS: return <MapPin className="h-5 w-5" />;
      case NotificationCategory.FINANCE: return <FileText className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.CRITICAL: return 'text-red-600 bg-red-50 border-red-100';
      case NotificationPriority.WARNING: return 'text-orange-600 bg-orange-50 border-orange-100';
      case NotificationPriority.SUCCESS: return 'text-green-600 bg-green-50 border-green-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  const getPriorityIcon = (priority: NotificationPriority) => {
     switch (priority) {
      case NotificationPriority.CRITICAL: return <AlertCircle className="h-4 w-4" />;
      case NotificationPriority.WARNING: return <AlertTriangle className="h-4 w-4" />;
      case NotificationPriority.SUCCESS: return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const displayedNotifications = filter === 'UNREAD' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="relative h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="relative">
               <Bell className="h-5 w-5 text-slate-700" />
               {unreadCount > 0 && (
                 <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>
               )}
            </div>
            <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{unreadCount}</span>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100">
           <div className="flex gap-2">
              <button 
                onClick={() => setFilter('ALL')}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                Tout
              </button>
              <button 
                onClick={() => setFilter('UNREAD')}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${filter === 'UNREAD' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                Non lus
              </button>
           </div>
           <button 
             onClick={handleMarkAllRead}
             className="text-xs font-medium text-blue-600 hover:underline flex items-center"
           >
             <CheckCheck className="h-3 w-3 mr-1" /> Tout marquer comme lu
           </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedNotifications.length > 0 ? (
            displayedNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`relative group rounded-xl border p-4 transition-all hover:shadow-md ${notif.isRead ? 'bg-white border-slate-200 opacity-75' : 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-100'}`}
              >
                 <div className="flex items-start gap-3">
                    <div className={`shrink-0 rounded-lg p-2 ${getPriorityColor(notif.priority)}`}>
                       {getIcon(notif.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">{notif.category}</span>
                          <span className="text-xs text-slate-400">{notif.timestamp}</span>
                       </div>
                       <h4 className={`text-sm font-bold mb-1 ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                          {notif.title}
                       </h4>
                       <p className="text-sm text-slate-600 leading-snug mb-2">
                          {notif.message}
                       </p>
                       
                       <div className="flex items-center gap-2 mt-2">
                          {notif.linkTo && (
                            <button 
                              onClick={() => { onNavigate(notif.linkTo!); onClose(); }}
                              className="text-xs font-bold text-blue-600 hover:underline"
                            >
                              Voir détails
                            </button>
                          )}
                          {!notif.isRead && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                               className="text-xs font-medium text-slate-400 hover:text-slate-600"
                             >
                               Marquer comme lu
                             </button>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Priority Badge Absolute */}
                 <div className="absolute top-4 right-4">
                    <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getPriorityColor(notif.priority)} bg-opacity-20 border-opacity-0`}>
                       {getPriorityIcon(notif.priority)}
                       {notif.priority}
                    </div>
                 </div>

                 {/* Delete Action */}
                 <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                    className="absolute bottom-4 right-4 p-1 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                 >
                    <Trash2 className="h-4 w-4" />
                 </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <Bell className="h-12 w-12 mb-4 opacity-20" />
               <p className="text-sm">Aucune notification</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};