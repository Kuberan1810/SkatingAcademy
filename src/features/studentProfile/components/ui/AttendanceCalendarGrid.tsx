import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Calendar } from 'iconsax-react-native';
import { Play } from 'lucide-react-native';
import { AttendanceDayItem, AttendanceDayStatus } from '../../types';

export interface AttendanceCalendarGridProps {
  days?: AttendanceDayItem[];
  scheduledDaysCount?: number;
  initialDate?: Date;
}

export default function AttendanceCalendarGrid({
  days,
  scheduledDaysCount = 12,
  initialDate,
}: AttendanceCalendarGridProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (days && days.length > 0 && days[0].fullDate) {
      const parts = days[0].fullDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          return new Date(y, m, 1);
        }
      }
    }
    return initialDate || new Date();
  });

  useEffect(() => {
    if (days && days.length > 0 && days[0].fullDate) {
      const parts = days[0].fullDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          setCurrentDate(new Date(y, m, 1));
        }
      }
    }
  }, [days]);

  const handlePrevMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const today = new Date();
    const isTodayYear = today.getFullYear() === year;
    const isTodayMonth = today.getMonth() === month;
    const todayDateNumber = today.getDate();

    const firstDayOfMonth = new Date(year, month, 1);
    const startOffset = firstDayOfMonth.getDay(); // 0 for Sun, 6 for Sat
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDate = new Date(year, month, 0).getDate();

    const totalSlots =
      startOffset + daysInMonth <= 28
        ? 28
        : startOffset + daysInMonth <= 35
        ? 35
        : 42;

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysArray: {
      day: string;
      date: string;
      status: AttendanceDayStatus | 'other_month';
      isOtherMonth?: boolean;
    }[] = [];

    // 1. Previous Month Days (low opacity fill at start)
    for (let i = 0; i < startOffset; i++) {
      const prevDateNum = prevMonthLastDate - startOffset + 1 + i;
      const prevDate = new Date(year, month - 1, prevDateNum);
      daysArray.push({
        day: DAYS[prevDate.getDay()],
        date: prevDateNum.toString().padStart(2, '0'),
        status: 'other_month',
        isOtherMonth: true,
      });
    }

    // 2. Active Month Days (1 to daysInMonth)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = date.getDay();
      const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      let status: AttendanceDayStatus = 'none';
      const existingDay = days?.find((item) => item.fullDate === formattedDateStr);

      if (existingDay && existingDay.status && existingDay.status !== 'none') {
        status = existingDay.status;
      } else if (isTodayYear && isTodayMonth && d === todayDateNumber) {
        status = 'current';
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = 'weekend';
      } else {
        status = 'none';
      }

      daysArray.push({
        day: DAYS[dayOfWeek],
        date: d.toString().padStart(2, '0'),
        status,
        isOtherMonth: false,
      });
    }

    // 3. Next Month Days (low opacity fill at end to complete 7-column rows)
    const remainingSlots = totalSlots - daysArray.length;
    for (let j = 1; j <= remainingSlots; j++) {
      const nextDate = new Date(year, month + 1, j);
      daysArray.push({
        day: DAYS[nextDate.getDay()],
        date: j.toString().padStart(2, '0'),
        status: 'other_month',
        isOtherMonth: true,
      });
    }

    return daysArray;
  };

  const calendarData = generateDays();
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const monthTitle = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const getStatusStyles = (status: AttendanceDayStatus | 'other_month') => {
    switch (status) {
      case 'present':
        return { bg: '#2A9A4620', day: '#2A9A46', date: '#2A9A46', border: 'transparent', opacity: 1 };
      case 'absent':
        return { bg: '#FEE2E280', day: '#CE1919', date: '#CE1919', border: 'transparent', opacity: 1 };
      case 'holiday':
        return { bg: '#FFEDDD', day: '#FFBE85', date: '#FFBE85', border: 'transparent', opacity: 1 };
      case 'weekend':
        return { bg: '#FFEDDD90', day: '#333333', date: '#777777', border: 'transparent', opacity: 1 };
      case 'current':
        return { bg: '#FFEDDD', day: '#F67300', date: '#F67300', border: 'transparent', opacity: 1 };
      case 'other_month':
        return { bg: '#FAFAFA', day: '#C7C7CC', date: '#C7C7CC', border: '#E5E7EB', opacity: 0.55 };
      case 'none':
      default:
        return { bg: '#FFFFFF', day: '#333333', date: '#777777', border: '#E5E7EB', opacity: 1 };
    }
  };

  return (
    <View className="w-full">
      {/* Month Selector */}
      <View className="flex-row justify-center items-center mb-6">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePrevMonth}
          className="bg-[#fafafa] w-[30px] h-[30px] items-center justify-center rounded-[8px] border border-primary-border"
        >
          <View style={{ transform: [{ rotate: '180deg' }], marginLeft: -1 }}>
            <Play size={12} fill="#909090" color="#909090" />
          </View>
        </TouchableOpacity>
        <Text className="mx-6 font-urbanist-semibold text-[14px] text-primary">
          {monthTitle}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleNextMonth}
          className="bg-[#fafafa] w-[30px] h-[30px] items-center justify-center rounded-[8px] border border-primary-border"
        >
          <View style={{ marginLeft: 1 }}>
            <Play size={12} fill="#909090" color="#909090" />
          </View>
        </TouchableOpacity>
      </View>

      {/* 7 Column Layout: Sun to Sat */}
      <View className="flex-row flex-wrap justify-start gap-y-2.5">
        {calendarData.map((item, index) => {
          const statusStyle = getStatusStyles(item.status);
          const hasBorder = item.status === 'none' || item.status === 'other_month';

          return (
            <View
              key={index}
              style={{
                width: '13.5%',
                aspectRatio: 44 / 43,
                marginHorizontal: '0.38%',
                backgroundColor: statusStyle.bg,
                borderColor: statusStyle.border,
                borderWidth: hasBorder ? 1 : 0,
                opacity: statusStyle.opacity,
              }}
              className="rounded-[14px] items-center justify-center py-1.5 gap-0.5"
            >
              <Text
                style={{ color: statusStyle.day }}
                className="text-[13px] font-urbanist-semibold leading-none text-center"
              >
                {item.day}
              </Text>
              <Text
                style={{ color: statusStyle.date }}
                className="text-[12px] font-urbanist-medium leading-none text-center"
              >
                {item.date}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View className="flex-row justify-center items-center mt-8 gap-5 mb-8">
        <View className="flex-row items-center">
          <View className="w-3.5 h-3.5 rounded-[4px] bg-[#2A9A46] mr-2" />
          <Text className="text-[14px] text-secondary font-urbanist-medium">
            Present
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3.5 h-3.5 rounded-[4px] bg-[#CE1919] mr-2" />
          <Text className="text-[14px] text-secondary font-urbanist-medium">
            Absent
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3.5 h-3.5 rounded-[4px] bg-[#FFBE85] mr-2" />
          <Text className="text-[14px] text-secondary font-urbanist-medium">
            Current Day
          </Text>
        </View>
      </View>

      {/* Bottom Scheduled Days Pill */}
      <View className="w-full py-3.5 px-4 rounded-[12px] bg-[#FAFAFA] border border-primary-border flex-row items-center justify-center gap-2">
        <Calendar size={18} color="#626262" variant="Linear" />
        <Text className="text-[15px] font-urbanist-medium text-secondary">
          {scheduledDaysCount} Scheduled days
        </Text>
      </View>
    </View>
  );
}
