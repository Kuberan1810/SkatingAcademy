import React, { useState } from 'react';
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
  initialDate = new Date(2026, 0, 1), // Jan 2026 default
}: AttendanceCalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);

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

    const firstDayOfMonth = new Date(year, month, 1);
    const startOffset = firstDayOfMonth.getDay(); // 0 for Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fit into 4, 5, or 6 weeks depending on offset and days
    const totalSlots =
      startOffset + daysInMonth <= 28
        ? 28
        : startOffset + daysInMonth <= 35
        ? 35
        : 42;

    const daysArray: { day: string; date: string; status: AttendanceDayStatus }[] = [];
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < totalSlots; i++) {
      const date = new Date(year, month, i - startOffset + 1);

      let status: AttendanceDayStatus = 'none';
      if (date.getMonth() !== month) {
        status = 'none'; // Days from prev/next month
      } else {
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          status = 'weekend';
        } else {
          // If days prop is provided, look up by fullDate
          const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const existingDay = days?.find((d) => d.fullDate === formattedDateStr);
          if (existingDay) {
            status = existingDay.status;
          } else {
            // Default mock attendance logic
            const d = date.getDate();
            if (d === 15) status = 'holiday';
            else if (d === 14 || d === 18) status = 'absent';
            else if (d > 23 && year === 2026 && month === 0) status = 'none';
            else status = 'present';
          }
        }
      }

      daysArray.push({
        day: DAYS[date.getDay()],
        date: date.getDate().toString().padStart(2, '0'),
        status,
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

  const getStatusStyles = (status: AttendanceDayStatus) => {
    switch (status) {
      case 'present':
        return { bg: '#2A9A4620', day: '#2A9A46', date: '#2A9A46', border: 'transparent' };
      case 'absent':
        return { bg: '#FEE2E280', day: '#CE1919', date: '#CE1919', border: 'transparent' };
      case 'holiday':
        return { bg: '#FFEDDD', day: '#FFBE85', date: '#FFBE85', border: 'transparent' };
      case 'weekend':
        return { bg: '#FFEDDD', day: '#333333', date: '#777777', border: 'transparent' };
      case 'current':
        return { bg: '#2A9A4620', day: '#2A9A46', date: '#2A9A46', border: 'transparent' };
      case 'none':
      default:
        return { bg: '#FFFFFF', day: '#333333', date: '#777777', border: '#E5E7EB' };
    }
  };

  return (
    <View>
     

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

      {/* Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {calendarData.map((item, index) => {
          const statusStyle = getStatusStyles(item.status);

          return (
            <View
              key={index}
              style={{
                width: '13%',
                aspectRatio: 44 / 43,
                backgroundColor: statusStyle.bg,
                borderColor: statusStyle.border,
                borderWidth: item.status === 'none' ? 1 : 0,
              }}
              className="rounded-[14px] items-center justify-center py-1.5 gap-0.5"
            >
              <Text
                style={{ color: statusStyle.day }}
                className="text-[14px] font-urbanist-semibold leading-none text-center"
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
            Holiday
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
