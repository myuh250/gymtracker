const SAMPLE = [
  { id: 1, name: "Hít đất", muscleGroup: "Chest", description: "Tập ngực" },
  { id: 2, name: "Kéo xà", muscleGroup: "Back", description: "Tập lưng" },
  { id: 3, name: "Squat", muscleGroup: "Legs", description: "Tập chân" },
];

export function getExercises() {
  try {
    const raw = localStorage.getItem("exercises");
    if (!raw) {
      localStorage.setItem("exercises", JSON.stringify(SAMPLE));
      return SAMPLE.slice();
    }
    return JSON.parse(raw) || [];
  } catch (e) {
    console.error("getExercises error", e);
    return SAMPLE.slice();
  }
}

export function saveExercises(list) {
  try {
    localStorage.setItem("exercises", JSON.stringify(list || []));
  } catch (e) {
    console.error("saveExercises error", e);
  }
}

export function addExercise(item) {
  const list = getExercises();
  list.push(item);
  saveExercises(list);
  return item;
}

export function updateExercise(item) {
  const list = getExercises().map((e) => (e.id === item.id ? item : e));
  saveExercises(list);
  return item;
}

export function removeExercise(id) {
  const list = getExercises().filter((e) => e.id !== id);
  saveExercises(list);
  return id;
}

// Workout helpers
export function getWorkouts() {
  try {
    const raw = localStorage.getItem("workouts");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("getWorkouts error", e);
    return [];
  }
}

export function saveWorkouts(list) {
  try {
    localStorage.setItem("workouts", JSON.stringify(list || []));
  } catch (e) {
    console.error("saveWorkouts error", e);
  }
}

export function addWorkout(workout) {
  const list = getWorkouts();
  const workoutWithId = { ...workout, id: Date.now() };
  list.unshift(workoutWithId);
  saveWorkouts(list);
  return workoutWithId;
}

export function updateWorkout(workout) {
  const list = getWorkouts().map((w) => (w.id === workout.id ? workout : w));
  saveWorkouts(list);
  return workout;
}

export function toggleWorkoutCompleted(id) {
  const list = getWorkouts().map((w) =>
    w.id === id ? { ...w, isCompleted: !w.isCompleted } : w
  );
  saveWorkouts(list);
  return list.find((w) => w.id === id);
}

export function toggleExerciseCompleted(workoutId, exerciseId) {
  const list = getWorkouts().map((w) => {
    if (w.id !== workoutId) return w;

    const completedExercises = w.completedExercises || [];
    const isCompleted = completedExercises.includes(exerciseId);

    return {
      ...w,
      completedExercises: isCompleted
        ? completedExercises.filter((id) => id !== exerciseId)
        : [...completedExercises, exerciseId],
    };
  });
  saveWorkouts(list);
  return list.find((w) => w.id === workoutId);
}

export function removeWorkout(id) {
  const list = getWorkouts().filter((w) => w.id !== id);
  saveWorkouts(list);
  return id;
}
