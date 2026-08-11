/**
 * ============================================================================
 * FACEUP X — SHARED DAILY TRACKER MODULE (js/tracker.js)
 * Production-grade habit, streak, workout session & plan versioning controller
 * reused across all 6 analysis sections (Skin, Hair, Jawline, Masculinity, Eyes, Face).
 * ============================================================================
 */

export class DailyTrackerController {
  constructor(firebaseAuth = null, firestoreDb = null) {
    this.auth = firebaseAuth;
    this.db = firestoreDb;
    this.storageKeyPrefix = 'faceup_tracker_';
    this.planKeyPrefix = 'faceup_user_plan_';
    this.sessionKeyPrefix = 'faceup_workout_sessions_';
    this.nutritionKeyPrefix = 'faceup_user_nutrition_plan_';
    this.foodLogKeyPrefix = 'faceup_user_food_logs_';
    this.hairstyleKeyPrefix = 'faceup_user_hairstyles_';
    this.listeners = [];
  }

  /**
   * Format today's date as standard YYYY-MM-DD
   */
  getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * Get past 7 dates as YYYY-MM-DD array
   */
  getLast7DaysKeys() {
    const keys = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      keys.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dateNum: d.getDate(),
        isToday: i === 0
      });
    }
    return keys;
  }

  /**
   * -------------------------------------------------------------
   * USER-SCOPED EXERCISE PLAN PERSISTENCE & VERSIONING
   * (Generated ONCE per user + section, reused across subsequent scans)
   * -------------------------------------------------------------
   */

  /**
   * Get active user exercise plan for a section. Returns null if not yet created.
   */
  getUserExercisePlan(userId = 'guest', sectionId) {
    const key = `${this.planKeyPrefix}${userId}_${sectionId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading user exercise plan:', e);
    }
    return null;
  }

  /**
   * Save or regenerate user exercise plan with version history
   */
  saveUserExercisePlan(userId = 'guest', sectionId, planData, isRegenerate = false) {
    const key = `${this.planKeyPrefix}${userId}_${sectionId}`;
    let existing = this.getUserExercisePlan(userId, sectionId);

    const now = new Date().toISOString();

    if (!existing) {
      existing = {
        userId,
        sectionId,
        activeVersion: 1,
        createdAt: now,
        updatedAt: now,
        currentPlan: planData,
        versions: [
          {
            version: 1,
            createdAt: now,
            plan: planData
          }
        ]
      };
    } else if (isRegenerate) {
      const newVersion = (existing.activeVersion || 1) + 1;
      existing.activeVersion = newVersion;
      existing.updatedAt = now;
      existing.currentPlan = planData;
      existing.versions = existing.versions || [];
      existing.versions.push({
        version: newVersion,
        createdAt: now,
        plan: planData
      });
    } else {
      existing.currentPlan = planData;
      existing.updatedAt = now;
    }

    try {
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.warn('Error saving user exercise plan:', e);
    }

    return existing;
  }

  /**
   * -------------------------------------------------------------
   * WORKOUT SESSION LOGGING & ACTIVE SESSION PROGRESS
   * -------------------------------------------------------------
   */

  /**
   * Log an active workout session completion
   */
  logWorkoutSession(userId = 'guest', sectionId, sessionData) {
    const key = `${this.sessionKeyPrefix}${userId}_${sectionId}`;
    let sessions = [];
    try {
      const raw = localStorage.getItem(key);
      if (raw) sessions = JSON.parse(raw);
    } catch {}

    const sessionRecord = {
      id: 'SESS-' + Math.random().toString(36).substr(2, 7).toUpperCase(),
      userId,
      sectionId,
      exerciseId: sessionData.exerciseId,
      exerciseName: sessionData.exerciseName,
      planVersion: sessionData.planVersion || 1,
      setsCompleted: sessionData.setsCompleted || 1,
      repsOrDuration: sessionData.repsOrDuration || 'Complete',
      timestamp: new Date().toISOString(),
      dateKey: this.getTodayKey()
    };

    sessions.push(sessionRecord);

    try {
      localStorage.setItem(key, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Error saving workout session:', e);
    }

    // Automatically check off item in today's daily tracker
    this.toggleTodayItem(sectionId, 'exercises', sessionData.exerciseId, 3, true);

    return sessionRecord;
  }

  /**
   * Get all logged workout sessions for an exercise
   */
  getExerciseHistory(userId = 'guest', sectionId, exerciseId) {
    const key = `${this.sessionKeyPrefix}${userId}_${sectionId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const sessions = JSON.parse(raw);
        return sessions.filter(s => s.exerciseId === exerciseId);
      }
    } catch {}
    return [];
  }

  /**
   * Get score progression across scans for this section
   */
  getScoreProgressOverTime(userId = 'guest', sectionId, currentScanScore = 85) {
    // Collect from scanReports in localStorage or cache
    const points = [];
    try {
      const scanKey = `faceup_scans_history_${userId}`;
      const raw = localStorage.getItem(scanKey);
      if (raw) {
        const scans = JSON.parse(raw);
        scans.forEach(s => {
          if (s.sectionScores && s.sectionScores[sectionId]) {
            points.push({
              date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              score: s.sectionScores[sectionId]
            });
          }
        });
      }
    } catch {}

    if (points.length === 0) {
      // Default baseline trend
      const d1 = new Date();
      d1.setDate(d1.getDate() - 14);
      const d2 = new Date();
      d2.setDate(d2.getDate() - 7);
      const d3 = new Date();

      points.push({ date: d1.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), score: Math.max(60, currentScanScore - 6) });
      points.push({ date: d2.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), score: Math.max(65, currentScanScore - 2) });
      points.push({ date: d3.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), score: currentScanScore });
    }

    return points;
  }

  /**
   * -------------------------------------------------------------
   * USER-SCOPED NUTRITION PLAN & ACTIVE FOOD LOGGING
   * (Shared ONCE per user across all 6 sections)
   * -------------------------------------------------------------
   */

  /**
   * Get active user nutrition plan. Returns null if not yet created.
   */
  getUserNutritionPlan(userId = 'guest') {
    const key = `${this.nutritionKeyPrefix}${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading user nutrition plan:', e);
    }
    return null;
  }

  /**
   * Save or regenerate user nutrition plan with version history
   */
  saveUserNutritionPlan(userId = 'guest', planData, isRegenerate = false) {
    const key = `${this.nutritionKeyPrefix}${userId}`;
    let existing = this.getUserNutritionPlan(userId);
    const now = new Date().toISOString();

    if (!existing) {
      existing = {
        userId,
        activeVersion: 1,
        createdAt: now,
        updatedAt: now,
        currentPlan: planData,
        versions: [
          {
            version: 1,
            createdAt: now,
            plan: planData
          }
        ]
      };
    } else if (isRegenerate) {
      const newVersion = (existing.activeVersion || 1) + 1;
      existing.activeVersion = newVersion;
      existing.updatedAt = now;
      existing.currentPlan = planData;
      existing.versions = existing.versions || [];
      existing.versions.push({
        version: newVersion,
        createdAt: now,
        plan: planData
      });
    } else {
      existing.currentPlan = planData;
      existing.updatedAt = now;
    }

    try {
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.warn('Error saving user nutrition plan:', e);
    }

    return existing;
  }

  /**
   * Get all food log entries for a user (optionally filtered by dateKey)
   */
  getFoodLogs(userId = 'guest', dateKey = null) {
    const key = `${this.foodLogKeyPrefix}${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const list = JSON.parse(raw);
        if (dateKey) {
          return list.filter(item => item.dateKey === dateKey);
        }
        return list;
      }
    } catch {}
    return [];
  }

  /**
   * Add a food log entry
   */
  addFoodLogEntry(userId = 'guest', entry) {
    const key = `${this.foodLogKeyPrefix}${userId}`;
    let logs = this.getFoodLogs(userId);

    const userPlan = this.getUserNutritionPlan(userId);
    const planVersion = userPlan?.activeVersion || 1;

    const newRecord = {
      id: 'MEAL-' + Math.random().toString(36).substr(2, 7).toUpperCase(),
      userId,
      planVersion,
      foodName: entry.foodName || 'Scanned Meal',
      portion: entry.portion || '1 Serving',
      calories: parseInt(entry.calories || 0, 10),
      protein: parseInt(entry.protein || 0, 10),
      carbs: parseInt(entry.carbs || 0, 10),
      fat: parseInt(entry.fat || 0, 10),
      fiber: parseInt(entry.fiber || 0, 10),
      imageUrl: entry.imageUrl || null,
      timestamp: new Date().toISOString(),
      dateKey: entry.dateKey || this.getTodayKey()
    };

    logs.push(newRecord);

    try {
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (e) {
      console.warn('Error saving food log entry:', e);
    }

    // Auto update habit tracker for nutrition
    this.toggleTodayItem('nutrition_global', 'products', 'meal_logged', 1, true);

    return newRecord;
  }

  /**
   * Delete a food log entry
   */
  deleteFoodLogEntry(userId = 'guest', entryId) {
    const key = `${this.foodLogKeyPrefix}${userId}`;
    let logs = this.getFoodLogs(userId);
    logs = logs.filter(l => l.id !== entryId);

    try {
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (e) {
      console.warn('Error deleting food log entry:', e);
    }

    return logs;
  }

  /**
   * Get daily calorie & macronutrient summary for today
   */
  getDailyCalorieSummary(userId = 'guest', dateKey = null) {
    const targetDate = dateKey || this.getTodayKey();
    const todayLogs = this.getFoodLogs(userId, targetDate);
    const userPlan = this.getUserNutritionPlan(userId)?.currentPlan || {
      daily_calories: 2150,
      protein_g: 160,
      carbs_g: 210,
      fat_g: 65
    };

    const consumed = todayLogs.reduce((acc, curr) => {
      acc.calories += (curr.calories || 0);
      acc.protein += (curr.protein || 0);
      acc.carbs += (curr.carbs || 0);
      acc.fat += (curr.fat || 0);
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const allLogs = this.getFoodLogs(userId);
    const loggedDates = new Set(allLogs.map(l => l.dateKey));

    // Calculate streak
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const k = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (loggedDates.has(k)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (streak === 0 && k === this.getTodayKey()) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
          if (loggedDates.has(yKey)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    const last7 = this.getLast7DaysKeys();
    let daysWithinTarget = 0;
    last7.forEach(d => {
      const dayLogs = allLogs.filter(l => l.dateKey === d.key);
      const totalCal = dayLogs.reduce((sum, item) => sum + (item.calories || 0), 0);
      if (totalCal >= (userPlan.daily_calories * 0.75) && totalCal <= (userPlan.daily_calories * 1.15)) {
        daysWithinTarget++;
      }
    });

    const weeklyAdherence = Math.round((daysWithinTarget / 7) * 100);

    return {
      consumedCalories: consumed.calories,
      targetCalories: userPlan.daily_calories,
      consumedProtein: consumed.protein,
      targetProtein: userPlan.protein_g,
      consumedCarbs: consumed.carbs,
      targetCarbs: userPlan.carbs_g,
      consumedFat: consumed.fat,
      targetFat: userPlan.fat_g,
      caloriePct: Math.min(100, Math.round((consumed.calories / userPlan.daily_calories) * 100)),
      foodCount: todayLogs.length,
      streak: streak,
      weeklyAdherence: weeklyAdherence,
      plan: userPlan
    };
  }

  /**
   * Get 7-day rolling calorie history for chart
   */
  getWeeklyCalorieHistory(userId = 'guest') {
    const allLogs = this.getFoodLogs(userId);
    const userPlan = this.getUserNutritionPlan(userId)?.currentPlan || { daily_calories: 2150 };
    const last7 = this.getLast7DaysKeys();

    return last7.map(d => {
      const dayLogs = allLogs.filter(l => l.dateKey === d.key);
      const totalCal = dayLogs.reduce((sum, item) => sum + (item.calories || 0), 0);
      return {
        dateKey: d.key,
        dayName: d.dayName,
        dateNum: d.dateNum,
        isToday: d.isToday,
        calories: totalCal,
        target: userPlan.daily_calories,
        pct: Math.min(120, Math.round((totalCal / userPlan.daily_calories) * 100))
      };
    });
  }

  /**
   * -------------------------------------------------------------
   * USER-SCOPED RECOMMENDED HAIRSTYLES PERSISTENCE & VERSIONING
   * (Specific to Hair section only)
   * -------------------------------------------------------------
   */

  /**
   * Get active user recommended hairstyles. Returns null if not yet created.
   */
  getUserHairstyles(userId = 'guest') {
    const key = `${this.hairstyleKeyPrefix}${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading user hairstyles:', e);
    }
    return null;
  }

  /**
   * Save or regenerate user hairstyles with version history
   */
  saveUserHairstyles(userId = 'guest', hairstylesData, isRegenerate = false) {
    const key = `${this.hairstyleKeyPrefix}${userId}`;
    let existing = this.getUserHairstyles(userId);
    const now = new Date().toISOString();

    const list = hairstylesData?.hairstyles || hairstylesData || [];
    const disclaimer = hairstylesData?.disclaimer || "AI-generated style visualizations and recommendations are aesthetic projections.";

    if (!existing) {
      existing = {
        userId,
        activeVersion: 1,
        createdAt: now,
        updatedAt: now,
        hairstyles: list,
        disclaimer: disclaimer,
        versions: [
          {
            version: 1,
            createdAt: now,
            hairstyles: list
          }
        ]
      };
    } else if (isRegenerate) {
      const newVersion = (existing.activeVersion || 1) + 1;
      existing.activeVersion = newVersion;
      existing.updatedAt = now;
      existing.hairstyles = list;
      existing.disclaimer = disclaimer;
      existing.versions = existing.versions || [];
      existing.versions.push({
        version: newVersion,
        createdAt: now,
        hairstyles: list
      });
    } else {
      existing.hairstyles = list;
      existing.updatedAt = now;
    }

    try {
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.warn('Error saving user hairstyles:', e);
    }

    return existing;
  }

  /**
   * -------------------------------------------------------------
   * DAILY TRACKER STATS & CALENDAR
   * -------------------------------------------------------------
   */

  /**
   * Load tracker state for a section and type ('exercises' | 'products')
   */
  getTrackerState(sectionId, type = 'exercises') {
    const storageKey = `${this.storageKeyPrefix}${sectionId}_${type}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}

    return {
      sectionId,
      type,
      history: {},
      streak: 0,
      weeklyAdherence: 0,
      totalCompletions: 0
    };
  }

  /**
   * Save tracker state
   */
  saveTrackerState(sectionId, type, state) {
    const storageKey = `${this.storageKeyPrefix}${sectionId}_${type}`;
    this._recomputeStats(state);

    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    this.notifyListeners(sectionId, type, state);
  }

  /**
   * Toggle item completion for today
   */
  toggleTodayItem(sectionId, type, itemId, totalItemCount, forceCheck = false) {
    const state = this.getTrackerState(sectionId, type);
    const today = this.getTodayKey();

    if (!state.history[today]) {
      state.history[today] = { checkedItemIds: [], completedAll: false };
    }

    const currentChecked = state.history[today].checkedItemIds || [];
    const idx = currentChecked.indexOf(itemId);

    if (forceCheck) {
      if (idx === -1) currentChecked.push(itemId);
    } else {
      if (idx > -1) {
        currentChecked.splice(idx, 1);
      } else {
        currentChecked.push(itemId);
      }
    }

    state.history[today].checkedItemIds = currentChecked;
    state.history[today].completedAll = totalItemCount > 0 && currentChecked.length >= totalItemCount;

    this.saveTrackerState(sectionId, type, state);
    return state;
  }

  /**
   * Recompute streak and 7-day adherence
   */
  _recomputeStats(state) {
    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const log = state.history[key];
      if (log && log.checkedItemIds && log.checkedItemIds.length > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (streak === 0 && key === this.getTodayKey()) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
          const yLog = state.history[yKey];
          if (yLog && yLog.checkedItemIds && yLog.checkedItemIds.length > 0) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    state.streak = streak;

    const last7 = this.getLast7DaysKeys();
    let completedDays = 0;
    last7.forEach(d => {
      const entry = state.history[d.key];
      if (entry && entry.checkedItemIds && entry.checkedItemIds.length > 0) {
        completedDays++;
      }
    });

    state.weeklyAdherence = Math.round((completedDays / 7) * 100);
    state.totalCompletions = Object.values(state.history).filter(h => h.checkedItemIds && h.checkedItemIds.length > 0).length;
  }

  /**
   * Get combined section score summary for dashboard badge
   */
  getSectionAdherenceSummary(sectionId) {
    const exState = this.getTrackerState(sectionId, 'exercises');
    const prState = this.getTrackerState(sectionId, 'products');

    const maxStreak = Math.max(exState.streak || 0, prState.streak || 0);
    const avgAdherence = Math.round(((exState.weeklyAdherence || 0) + (prState.weeklyAdherence || 0)) / 2);

    return {
      streak: maxStreak,
      weeklyAdherence: avgAdherence,
      exerciseStreak: exState.streak || 0,
      productStreak: prState.streak || 0
    };
  }

  onUpdate(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(sectionId, type, state) {
    this.listeners.forEach(cb => {
      try { cb(sectionId, type, state); } catch {}
    });
  }

  /**
   * Shared DailyTracker UI Component Renderer
   */
  renderTrackerComponent(containerEl, sectionId, type, items, onToggle, onStartWorkout, onOpenHistory) {
    if (!containerEl) return;

    const state = this.getTrackerState(sectionId, type);
    const todayKey = this.getTodayKey();
    const todayLog = state.history[todayKey] || { checkedItemIds: [] };
    const checkedSet = new Set(todayLog.checkedItemIds || []);
    const last7Days = this.getLast7DaysKeys();

    const isEx = type === 'exercises';

    containerEl.innerHTML = `
      <div class="space-y-4">
        <!-- Streak & Weekly Adherence Header -->
        <div class="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#070709] border border-[#D4AF37]/30 shadow-xl">
          <div class="p-3 rounded-xl bg-[#12151F] border border-[#D4AF37]/35 flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-[#070709] text-amber-400 border border-amber-500/40 flex items-center justify-center text-base font-bold shadow-inner">
              🔥
            </div>
            <div>
              <div class="text-[9px] font-mono text-slate-400 uppercase tracking-wider">ACTIVE STREAK</div>
              <div class="text-sm font-bold text-amber-400 font-mono">${state.streak} ${state.streak === 1 ? 'Day' : 'Days'}</div>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-[#12151F] border border-[#D4AF37]/35 flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-[#070709] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center text-sm font-bold shadow-inner">
              <i class="fas fa-chart-line"></i>
            </div>
            <div>
              <div class="text-[9px] font-mono text-slate-400 uppercase tracking-wider">7-DAY ADHERENCE</div>
              <div class="text-sm font-bold text-[#F3D78E] font-mono">${state.weeklyAdherence}%</div>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-[#12151F] border border-emerald-500/35 flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-[#070709] text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-sm font-bold shadow-inner">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div>
              <div class="text-[9px] font-mono text-slate-400 uppercase tracking-wider">TOTAL SESSIONS</div>
              <div class="text-sm font-bold text-emerald-400 font-mono">${state.totalCompletions} Completed</div>
            </div>
          </div>
        </div>

        <!-- 7-Day Rolling Calendar Tracker -->
        <div class="p-4 rounded-2xl bg-[#0E1118] border border-[#D4AF37]/30 space-y-3 shadow-xl">
          <div class="flex items-center justify-between text-xs font-mono text-[#F3D78E] font-bold">
            <span class="flex items-center gap-2"><i class="fas fa-calendar-days text-[#D4AF37]"></i> THIS WEEK'S COMPLETION CALENDAR</span>
            <span class="text-[10px] text-slate-400 font-normal">TODAY: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <div class="grid grid-cols-7 gap-2 pt-1">
            ${last7Days.map(d => {
              const dayLog = state.history[d.key];
              const isDone = dayLog && dayLog.checkedItemIds && dayLog.checkedItemIds.length > 0;
              return `
                <div class="p-2.5 rounded-xl text-center space-y-1.5 transition-all ${d.isToday ? 'border-2 border-[#D4AF37] bg-[#D4AF37]/15 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'border border-slate-800/90 bg-[#12151F] hover:border-[#D4AF37]/40'}">
                  <div class="text-[10px] font-mono text-slate-400 uppercase font-bold">${d.dayName}</div>
                  <div class="text-sm font-bold ${d.isToday ? 'text-[#F3D78E]' : 'text-slate-200'} font-mono">${d.dateNum}</div>
                  <div class="w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] ${isDone ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/30' : 'bg-[#070709] border border-slate-800 text-slate-600'}">
                    ${isDone ? '<i class="fas fa-check"></i>' : '•'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Today's Items Checklist -->
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs font-mono text-[#F3D78E] font-bold border-b border-slate-800/80 pb-2">
            <span class="flex items-center gap-2">
              <i class="fas ${isEx ? 'fa-dumbbell text-[#D4AF37]' : 'fa-spray-can-sparkles text-[#D4AF37]'}"></i>
              TODAY'S ${isEx ? 'EXERCISE PROTOCOL' : 'PRODUCT APPLICATION'}
            </span>
            <span class="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#12151F] text-[#F3D78E] border border-[#D4AF37]/30">
              ${checkedSet.size} / ${items.length} Checked
            </span>
          </div>

          <div class="space-y-3">
            ${items.map((item, idx) => {
              const itemId = item.id || `item_${idx}`;
              const isChecked = checkedSet.has(itemId);
              return `
                <div class="p-4 rounded-2xl transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isChecked ? 'bg-[#0E1118] border border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.12)]' : 'bg-[#0E1118] border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 shadow-xl'}">
                  <div class="flex items-start gap-3.5 flex-1">
                    <button type="button" 
                            data-toggle-id="${itemId}"
                            class="w-7 h-7 rounded-xl flex items-center justify-center text-xs mt-0.5 shrink-0 transition-all cursor-pointer ${isChecked ? 'bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/30' : 'bg-[#070709] border border-slate-700 text-transparent hover:border-[#D4AF37]'}">
                      <i class="fas fa-check"></i>
                    </button>
                    <div class="space-y-1.5 flex-1">
                      <div class="flex items-center justify-between gap-2 flex-wrap">
                        <div class="font-bold text-sm ${isChecked ? 'text-emerald-300 line-through' : 'text-white'} font-mono">
                          ${item.name}
                        </div>
                        <div class="flex items-center gap-1.5">
                          ${item.difficulty ? `<span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#12151F] text-slate-300 border border-slate-700">${item.difficulty}</span>` : ''}
                          ${item.tag ? `<span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">${item.tag}</span>` : ''}
                          ${item.video_embed_id ? `<span class="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#F3D78E] border border-[#D4AF37]/30 flex items-center gap-1"><i class="fas fa-video"></i> VIDEO</span>` : ''}
                          ${item.image_steps ? `<span class="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#ECC86A]/15 text-[#F3D78E] border border-[#ECC86A]/30 flex items-center gap-1"><i class="fas fa-images"></i> 3 STEPS</span>` : ''}
                        </div>
                      </div>
                      <p class="text-[11px] text-slate-300 leading-relaxed font-sans">${item.description || item.how_to_use}</p>
                      <div class="flex items-center gap-3.5 text-[9px] font-mono text-slate-400 pt-0.5 flex-wrap">
                        ${item.sets_reps ? `<span class="flex items-center gap-1"><i class="fas fa-repeat text-[#D4AF37]"></i>${item.sets_reps}</span>` : ''}
                        ${item.frequency ? `<span class="flex items-center gap-1"><i class="fas fa-calendar-check text-emerald-400"></i>${item.frequency}</span>` : ''}
                        ${item.target_muscle ? `<span class="flex items-center gap-1"><i class="fas fa-bullseye text-[#F3D78E]"></i>${item.target_muscle}</span>` : ''}
                        ${item.active_ingredient ? `<span class="flex items-center gap-1"><i class="fas fa-flask text-[#D4AF37]"></i>${item.active_ingredient}</span>` : ''}
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons (Start Workout / History) -->
                  ${isEx ? `
                    <div class="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                      <button type="button" 
                              data-start-workout="${itemId}"
                              class="faceup-gold-btn px-4 py-2 rounded-xl text-black font-bold text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/20 flex items-center gap-1.5 w-full justify-center">
                        <i class="fas fa-play text-[9px]"></i>
                        <span>Start</span>
                      </button>
                      <button type="button" 
                              data-history-id="${itemId}"
                              class="px-3 py-1.5 rounded-xl bg-[#12151F] hover:bg-[#181B26] border border-slate-800 hover:border-[#D4AF37]/40 text-slate-300 hover:text-[#F3D78E] text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 w-full justify-center">
                        <i class="fas fa-chart-simple text-[#D4AF37]"></i>
                        <span>History</span>
                      </button>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // Bind check-off toggle clicks
    containerEl.querySelectorAll('[data-toggle-id]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const itemId = btn.getAttribute('data-toggle-id');
        this.toggleTodayItem(sectionId, type, itemId, items.length);
        if (onToggle) onToggle();
        this.renderTrackerComponent(containerEl, sectionId, type, items, onToggle, onStartWorkout, onOpenHistory);
      };
    });

    // Bind start workout clicks
    containerEl.querySelectorAll('[data-start-workout]').forEach(btn => {
      btn.onclick = () => {
        const itemId = btn.getAttribute('data-start-workout');
        const exercise = items.find(i => (i.id || '') === itemId);
        if (exercise && onStartWorkout) {
          onStartWorkout(exercise);
        }
      };
    });

    // Bind history clicks
    containerEl.querySelectorAll('[data-history-id]').forEach(btn => {
      btn.onclick = () => {
        const itemId = btn.getAttribute('data-history-id');
        const exercise = items.find(i => (i.id || '') === itemId);
        if (exercise && onOpenHistory) {
          onOpenHistory(exercise);
        }
      };
    });
  }

  /**
   * Get active or versioned Makeup Guide for a user and scan ID
   */
  getUserMakeupGuide(userId = 'guest', scanId = 'default') {
    const key = `faceup_user_makeup_guide_${userId}_${scanId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading user makeup guide:', e);
    }
    return null;
  }

  /**
   * Save or regenerate Makeup Guide with unique guide ID & version history
   */
  saveUserMakeupGuide(userId = 'guest', scanId = 'default', guideData, isRegenerate = false) {
    const key = `faceup_user_makeup_guide_${userId}_${scanId}`;
    let existing = this.getUserMakeupGuide(userId, scanId);

    const now = new Date().toISOString();
    const uniqueGuideId = guideData.guideId || `MKP-GUIDE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const fullGuideRecord = {
      ...guideData,
      guideId: uniqueGuideId,
      scanId,
      userId,
      createdAt: now
    };

    if (!existing) {
      existing = {
        userId,
        scanId,
        activeGuideId: uniqueGuideId,
        activeVersion: 1,
        createdAt: now,
        updatedAt: now,
        currentGuide: fullGuideRecord,
        versions: [
          {
            version: 1,
            guideId: uniqueGuideId,
            createdAt: now,
            guide: fullGuideRecord
          }
        ]
      };
    } else if (isRegenerate) {
      const newVersion = (existing.activeVersion || 1) + 1;
      existing.activeVersion = newVersion;
      existing.activeGuideId = uniqueGuideId;
      existing.updatedAt = now;
      existing.currentGuide = fullGuideRecord;
      existing.versions = existing.versions || [];
      existing.versions.push({
        version: newVersion,
        guideId: uniqueGuideId,
        createdAt: now,
        guide: fullGuideRecord
      });
    } else {
      existing.currentGuide = fullGuideRecord;
      existing.updatedAt = now;
    }

    try {
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.warn('Error saving user makeup guide:', e);
    }

    return existing;
  }
}
