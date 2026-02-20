import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CalendarProps {
  markedDates: Set<string>;
  onSelectDate: (date: string) => void;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getTodayString(): string {
  const now = new Date();
  return toDateString(now.getFullYear(), now.getMonth(), now.getDate());
}

interface DayCell {
  day: number;
  dateString: string;
  isCurrentMonth: boolean;
}

function buildGrid(year: number, month: number): DayCell[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];

  // Previous month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    cells.push({
      day,
      dateString: toDateString(prevYear, prevMonth, day),
      isCurrentMonth: false,
    });
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      dateString: toDateString(year, month, day),
      isCurrentMonth: true,
    });
  }

  // Next month fill
  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    cells.push({
      day,
      dateString: toDateString(nextYear, nextMonth, day),
      isCurrentMonth: false,
    });
  }

  // Split into rows of 7
  const rows: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

export default function Calendar({ markedDates, onSelectDate }: CalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const today = getTodayString();
  const grid = buildGrid(year, month);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const prevYear = () => setYear(year - 1);
  const nextYear = () => setYear(year + 1);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={prevYear} hitSlop={8} style={styles.navButton}>
          <Ionicons name="chevron-back" size={18} color="#8E8E93" />
          <Ionicons
            name="chevron-back"
            size={18}
            color="#8E8E93"
            style={{ marginLeft: -10 }}
          />
        </Pressable>
        <Pressable onPress={prevMonth} hitSlop={8} style={styles.navButton}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <Pressable onPress={nextMonth} hitSlop={8} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={nextYear} hitSlop={8} style={styles.navButton}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#8E8E93"
            style={{ marginRight: -10 }}
          />
          <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
        </Pressable>
      </View>

      {/* Day-of-week row */}
      <View style={styles.weekRow}>
        {DAYS.map((d, i) => (
          <View key={i} style={styles.weekCell}>
            <Text style={styles.weekText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Date grid */}
      {grid.map((row, ri) => (
        <View key={ri} style={styles.weekRow}>
          {row.map((cell, ci) => {
            const isToday = cell.dateString === today;
            const isMarked = markedDates.has(cell.dateString);

            return (
              <Pressable
                key={ci}
                style={styles.dayCell}
                onPress={() => onSelectDate(cell.dateString)}
              >
                <View
                  style={[styles.dayInner, isToday && styles.todayRing]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !cell.isCurrentMonth && styles.dayTextDimmed,
                      isToday && styles.dayTextToday,
                    ]}
                  >
                    {cell.day}
                  </Text>
                </View>
                {isMarked && <View style={styles.dot} />}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 4,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    minWidth: 160,
  },
  weekRow: {
    flexDirection: "row",
  },
  weekCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  weekText: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "600",
  },
  dayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  dayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  todayRing: {
    borderWidth: 2,
    borderColor: "#FF6B35",
  },
  dayText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  dayTextDimmed: {
    color: "#48484A",
  },
  dayTextToday: {
    color: "#FF6B35",
    fontWeight: "700",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#FF6B35",
    marginTop: 2,
  },
});
