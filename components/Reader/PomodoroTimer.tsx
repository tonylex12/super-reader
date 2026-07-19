import React, { useState, useEffect, useRef } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { THEME_COLORS, ThemeType } from "./types";
import { CustomAlert } from "../CustomAlert";
import { TimeInputModal } from "./TimeInputModal";
import { ReadingNoteModal } from "../Notes";

interface PomodoroTimerProps {
  colors: typeof THEME_COLORS[ThemeType];
  currentPage: number;
  onSaveNote: (text: string, page: number) => void;
  pdfName: string;
  theme: ThemeType;
}

const DEFAULT_POMODORO_DURATION = 25 * 60; // 25 minutos en segundos

export const PomodoroTimer = React.memo(({ 
  colors,
  currentPage,
  onSaveNote,
  pdfName,
  theme,
}: PomodoroTimerProps) => {
  const [timerDuration, setTimerDuration] = useState(DEFAULT_POMODORO_DURATION);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [blink, setBlink] = useState(true);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  
  const intervalRef = useRef<any>(null);

  // Efecto para controlar el decremento de los segundos
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setBlink((b) => !b);
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Completado
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            
            // Disparar la alerta customizada con la opción de escribir nota
            CustomAlert.alert(
              "¡Tiempo de Descanso!",
              `Has completado tu sesión de lectura de ${Math.round(timerDuration / 60)} minutos. Es hora de tomar un descanso de 5 minutos. ¿Deseas guardar una reflexión de lectura?`,
              [
                { 
                  text: "Escribir nota", 
                  style: "default",
                  onPress: () => {
                    setIsNoteModalOpen(true);
                  }
                },
                { 
                  text: "Iniciar descanso (5 min)", 
                  style: "default",
                  onPress: () => {
                    setSecondsLeft(5 * 60);
                    setIsRunning(true);
                  }
                },
                { 
                  text: "Entendido", 
                  style: "cancel",
                  onPress: () => setSecondsLeft(timerDuration)
                }
              ]
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timerDuration]);

  // Formatear segundos a MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePress = () => {
    if (!isRunning) {
      // Si el descanso terminó o se completó, reiniciar a la duración definida al iniciar
      const needsReset = secondsLeft === 0 || secondsLeft === 5 * 60;
      
      CustomAlert.alert(
        "Lector Pomodoro",
        `¿Deseas iniciar el temporizador con ${Math.round(timerDuration / 60)} minutos?`,
        [
          {
            text: "Iniciar",
            onPress: () => {
              if (needsReset) {
                setSecondsLeft(timerDuration);
              }
              setIsRunning(true);
            }
          },
          {
            text: "Personalizar tiempo...",
            onPress: () => setIsTimeModalOpen(true)
          },
          {
            text: "Cancelar",
            style: "cancel"
          }
        ]
      );
    } else {
      // Si ya está corriendo, permitir pausar o reiniciar
      CustomAlert.alert(
        "Lector Pomodoro",
        `El temporizador está corriendo (${formatTime(secondsLeft)}). ¿Qué deseas hacer?`,
        [
          {
            text: "Pausar",
            onPress: () => setIsRunning(false),
          },
          {
            text: "Reiniciar",
            style: "destructive",
            onPress: () => {
              setIsRunning(false);
              setSecondsLeft(timerDuration);
            },
          },
          {
            text: "Cancelar",
            style: "cancel",
          },
        ]
      );
    }
  };

  // Si está en pausa pero no está en la duración completa, mostrar opciones
  const handlePausedPress = () => {
    CustomAlert.alert(
      "Lector Pomodoro",
      `El temporizador está en pausa (${formatTime(secondsLeft)}).`,
      [
        {
          text: "Reanudar",
          onPress: () => setIsRunning(true),
        },
        {
          text: "Personalizar tiempo...",
          onPress: () => setIsTimeModalOpen(true),
        },
        {
          text: "Reiniciar",
          style: "destructive",
          onPress: () => {
            setSecondsLeft(timerDuration);
          },
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  const handleConfirmDuration = (minutes: number) => {
    const durationSeconds = minutes * 60;
    setTimerDuration(durationSeconds);
    setSecondsLeft(durationSeconds);
    setIsRunning(false);
  };

  const isPaused = !isRunning && secondsLeft < timerDuration;

  return (
    <View className="flex-row items-center">
      <TouchableOpacity
        onPress={isPaused ? handlePausedPress : handlePress}
        style={{ 
          backgroundColor: isRunning ? colors.accent : colors.buttonBg,
          borderColor: isRunning ? "transparent" : colors.border
        }}
        className="flex-row items-center px-3 py-1.5 rounded-full border mr-1"
      >
        <Feather 
          name="clock" 
          size={14} 
          color={isRunning ? "#FFFFFF" : colors.iconColor} 
          className="mr-1.5"
        />
        <Text 
          style={{ color: isRunning ? "#FFFFFF" : colors.text }} 
          className="font-semibold text-xs tabular-nums"
        >
          {formatTime(secondsLeft)}
        </Text>
        {isRunning && (
          <View 
            style={{ opacity: blink ? 1 : 0.3 }} 
            className="ml-1.5 h-1.5 w-1.5 rounded-full bg-white" 
          />
        )}
      </TouchableOpacity>

      {/* Modal para ingresar tiempo manualmente */}
      <TimeInputModal
        visible={isTimeModalOpen}
        currentMinutes={Math.round(timerDuration / 60)}
        colors={colors}
        onClose={() => setIsTimeModalOpen(false)}
        onConfirm={handleConfirmDuration}
      />

      {/* Modal para redactar nota de lectura */}
      <ReadingNoteModal
        visible={isNoteModalOpen}
        pdfName={pdfName}
        page={currentPage}
        theme={theme}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={(text) => {
          onSaveNote(text, currentPage);
          setIsNoteModalOpen(false);
          setSecondsLeft(timerDuration);
        }}
      />
    </View>
  );
});
