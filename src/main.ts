import { Plugin, MarkdownView } from 'obsidian';
import { EditorView } from '@codemirror/view';

interface DateMatch {
  dateStr: string;
  startCh: number;
  endCh: number;
  line: number;
}

export default class DatePickerCalendarPlugin extends Plugin {
  private calendarPopup: HTMLElement | null = null;
  private currentDateMatch: DateMatch | null = null;

  async onload() {
    console.log('Loading Date Picker Calendar Plugin');
    
    // 注册编辑器扩展
    this.registerEditorExtension(this.createDateCursorExtension());
    
    // 注册全局点击事件来关闭日历
    this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
      if (this.calendarPopup && !this.calendarPopup.contains(evt.target as Node)) {
        this.closeCalendar();
      }
    });
  }

  onunload() {
    this.closeCalendar();
  }

  private createDateCursorExtension() {
    const plugin = this;
    let checkTimeout: NodeJS.Timeout | null = null;

    return EditorView.updateListener.of((update) => {
      if (update.selectionSet) {
        // 清除之前的超时
        if (checkTimeout) {
          clearTimeout(checkTimeout);
        }

        // 延迟检查，避免频繁触发
        checkTimeout = setTimeout(() => {
          const view = update.view;
          const selection = view.state.selection.main;
          const cursorPos = selection.head;
          
          // 获取当前行
          const line = view.state.doc.lineAt(cursorPos);
          const lineText = line.text;
          const lineNumber = line.number - 1; // 转换为0基索引
          
          // 查找日期模式
          const dateRegex = /📅\s*(\d{4}-\d{2}-\d{2})/g;
          let match;
          let found = false;
          
          while ((match = dateRegex.exec(lineText)) !== null) {
            const matchStart = line.from + match.index;
            const matchEnd = matchStart + match[0].length;
            
            // 检查光标是否在匹配范围内
            if (cursorPos >= matchStart && cursorPos <= matchEnd) {
              // 获取光标位置的坐标
              const coords = view.coordsAtPos(matchStart);
              if (coords) {
                const dateStr = match[1];
                plugin.showCalendar(
                  { left: coords.left, top: coords.top, bottom: coords.bottom },
                  {
                    dateStr,
                    startCh: match.index,
                    endCh: match.index + match[0].length,
                    line: lineNumber
                  }
                );
                found = true;
              }
              break;
            }
          }
          
          if (!found) {
            plugin.closeCalendar();
          }
        }, 100);
      }
    });
  }

  private showCalendar(position: { left: number; top: number; bottom: number }, dateMatch: DateMatch) {
    // 关闭现有的日历
    this.closeCalendar();
    
    this.currentDateMatch = dateMatch;
    
    // 创建日历元素
    const calendar = this.createCalendarElement(dateMatch.dateStr);
    document.body.appendChild(calendar);
    this.calendarPopup = calendar;
    
    // 计算位置
    const rect = calendar.getBoundingClientRect();
    let left = position.left;
    let top = position.bottom + 5;
    
    // 确保日历不会超出屏幕边界
    if (left + rect.width > window.innerWidth) {
      left = window.innerWidth - rect.width - 10;
    }
    
    if (top + rect.height > window.innerHeight) {
      top = position.top - rect.height - 5;
    }
    
    calendar.style.left = `${left}px`;
    calendar.style.top = `${top}px`;
  }

  private createCalendarElement(dateStr: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'date-picker-calendar-popup';
    
    const currentDate = dateStr ? new Date(dateStr) : new Date();
    let viewYear = currentDate.getFullYear();
    let viewMonth = currentDate.getMonth();
    
    const render = () => {
      container.innerHTML = '';
      
      // 快捷选择区域
      const shortcuts = container.createDiv({ cls: 'calendar-shortcuts' });
      const shortcutItems = [
        { label: '今天', offset: 0 },
        { label: '明天', offset: 1 },
        { label: '2天后', offset: 2 },
        { label: '3天后', offset: 3 },
        { label: '1周后', offset: 7 }
      ];
      
      shortcutItems.forEach(item => {
        const btn = shortcuts.createEl('div', {
          text: item.label,
          cls: 'calendar-shortcut-btn'
        });
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const date = new Date();
          date.setDate(date.getDate() + item.offset);
          this.selectDate(this.formatDate(date));
        });
      });
      
      // 清除按钮
      const clearBtn = shortcuts.createEl('div', {
        text: '清除',
        cls: 'calendar-shortcut-btn calendar-clear-btn'
      });
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearDate();
      });
      
      // 日历主体
      const calendarMain = container.createDiv({ cls: 'calendar-main' });
      
      // 日历头部
      const header = calendarMain.createDiv({ cls: 'calendar-header' });
      
      const prevBtn = header.createEl('button', { text: '‹', cls: 'calendar-nav-btn' });
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        viewMonth--;
        if (viewMonth < 0) {
          viewMonth = 11;
          viewYear--;
        }
        render();
      });
      
      const monthYearLabel = header.createEl('div', {
        text: `${viewYear}年${viewMonth + 1}月`,
        cls: 'calendar-month-year'
      });
      
      const nextBtn = header.createEl('button', { text: '›', cls: 'calendar-nav-btn' });
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        viewMonth++;
        if (viewMonth > 11) {
          viewMonth = 0;
          viewYear++;
        }
        render();
      });
      
      // 星期标题
      const weekHeader = calendarMain.createDiv({ cls: 'calendar-week-header' });
      const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
      weekDays.forEach(day => {
        weekHeader.createEl('div', { text: day, cls: 'calendar-weekday' });
      });
      
      // 日期网格
      const grid = calendarMain.createDiv({ cls: 'calendar-grid' });
      
      // 计算日历网格
      const firstDay = new Date(viewYear, viewMonth, 1);
      const lastDay = new Date(viewYear, viewMonth + 1, 0);
      
      // 获取第一天是星期几（转换为周一开始）
      let startDayOfWeek = firstDay.getDay() - 1;
      if (startDayOfWeek === -1) startDayOfWeek = 6;
      
      const daysInMonth = lastDay.getDate();
      const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
      
      // 添加上个月的日期
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        grid.createEl('div', {
          text: day.toString(),
          cls: 'calendar-day calendar-day-other-month'
        });
      }
      
      // 添加当前月的日期
      for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = grid.createEl('div', {
          text: day.toString(),
          cls: 'calendar-day'
        });
        
        const cellDate = new Date(viewYear, viewMonth, day);
        const cellDateStr = this.formatDate(cellDate);
        
        // 标记选中的日期
        if (cellDateStr === dateStr) {
          dayEl.addClass('calendar-day-selected');
        }
        
        // 标记今天
        const today = new Date();
        if (cellDate.toDateString() === today.toDateString()) {
          dayEl.addClass('calendar-day-today');
        }
        
        dayEl.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectDate(cellDateStr);
        });
      }
      
      // 添加下个月的日期（填满6行）
      const totalCells = startDayOfWeek + daysInMonth;
      const remainingCells = 42 - totalCells; // 6行 * 7列 = 42
      for (let i = 1; i <= remainingCells && totalCells + i <= 42; i++) {
        grid.createEl('div', {
          text: i.toString(),
          cls: 'calendar-day calendar-day-other-month'
        });
      }
    };
    
    render();
    return container;
  }

  private selectDate(dateStr: string) {
    if (!this.currentDateMatch) return;
    
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;
    
    const editor = view.editor;
    const { line, startCh, endCh } = this.currentDateMatch;
    
    // 替换日期
    editor.replaceRange(
      `📅 ${dateStr}`,
      { line, ch: startCh },
      { line, ch: endCh }
    );
    
    this.closeCalendar();
  }

  private clearDate() {
    if (!this.currentDateMatch) return;
    
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;
    
    const editor = view.editor;
    const { line, startCh, endCh } = this.currentDateMatch;
    
    // 清除整个日期内容
    editor.replaceRange(
      '',
      { line, ch: startCh },
      { line, ch: endCh }
    );
    
    this.closeCalendar();
  }

  private closeCalendar() {
    if (this.calendarPopup) {
      this.calendarPopup.remove();
      this.calendarPopup = null;
    }
    this.currentDateMatch = null;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}