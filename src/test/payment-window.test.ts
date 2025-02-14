import { getPaymentWindowStatus, getNextWindowDate } from '../utils/payment-window';

describe('Payment Window Tests', () => {
  // Mock Date for consistent testing
  const mockDate = (dateString: string) => {
    const RealDate = Date;
    const testDate = new RealDate(dateString);
    
    global.Date = class extends RealDate {
      constructor() {
        super();
        return testDate;
      }
      static now() {
        return testDate.getTime();
      }
    } as DateConstructor;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Leap Year Tests', () => {
    test('February 28 in non-leap year (2023)', () => {
      mockDate('2023-02-28');
      const result = getPaymentWindowStatus();
      expect(result.isOpen).toBe(true);
      expect(result.opensOn).toContain('28th of February');
      expect(result.closesOn).toContain('5th of March');
    });

    test('February 29 in leap year (2024)', () => {
      mockDate('2024-02-29');
      const result = getPaymentWindowStatus();
      expect(result.isOpen).toBe(true);
      expect(result.opensOn).toContain('29th of February');
      expect(result.closesOn).toContain('5th of March');
    });

    test('February 28 in leap year (2024)', () => {
      mockDate('2024-02-28');
      const result = getPaymentWindowStatus();
      expect(result.isOpen).toBe(false);
      expect(result.opensOn).toContain('29th of February');
      expect(result.closesOn).toContain('5th of March');
    });
  });

  describe('Regular Months Tests', () => {
    test('January 30 - Opening day', () => {
      mockDate('2024-01-30');
      const result = getPaymentWindowStatus();
      expect(result.isOpen).toBe(true);
      expect(result.opensOn).toContain('30th of January');
      expect(result.closesOn).toContain('5th of February');
    });

    test('March 30 - Opening day', () => {
      mockDate('2024-03-30');
      const result = getPaymentWindowStatus();
      expect(result.isOpen).toBe(true);
      expect(result.opensOn).toContain('30th of March');
      expect(result.closesOn).toContain('5th of April');
    });

    test('First 5 days of month - Window still open', () => {
      mockDate('2024-04-01');
      const result = getPaymentWindowStatus();
      expect(result.isOpen).toBe(true);
      expect(result.opensOn).toContain('30th of April');
    });

    test('April 5 - Last day of window', () => {
      mockDate('2024-04-05');
      const result = getPaymentWindowStatus();
      expect(result.isOpen).toBe(true);
    });

    test('April 6 - Window closed', () => {
      mockDate('2024-04-06');
      const result = getPaymentWindowStatus();
      expect(result.isOpen).toBe(false);
    });
  });

  describe('Next Window Date Tests', () => {
    test('Next window from mid-month', () => {
      mockDate('2024-03-15');
      const nextDate = getNextWindowDate(new Date());
      expect(nextDate.getDate()).toBe(30);
      expect(nextDate.getMonth()).toBe(2); // March
    });

    test('Next window from end of year', () => {
      mockDate('2023-12-31');
      const nextDate = getNextWindowDate(new Date());
      expect(nextDate.getDate()).toBe(30);
      expect(nextDate.getMonth()).toBe(0); // January
      expect(nextDate.getFullYear()).toBe(2024);
    });
  });

  describe('Days Until Open Calculation', () => {
    test('Calculate days until next window', () => {
      mockDate('2024-03-15');
      const result = getPaymentWindowStatus();
      expect(result.daysUntilOpen).toBe(15); // 15 days until March 30
    });

    test('Calculate days when window is open', () => {
      mockDate('2024-03-30');
      const result = getPaymentWindowStatus();
      expect(result.daysUntilOpen).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('Year transition', () => {
      mockDate('2023-12-31');
      const result = getPaymentWindowStatus();
      expect(result.isOpen).toBe(false);
      expect(result.opensOn).toContain('30th of January');
      expect(result.closesOn).toContain('5th of February');
    });

    test('Month with 31 days', () => {
      mockDate('2024-05-31');
      const result = getPaymentWindowStatus();
      expect(result.isOpen).toBe(true);
      expect(result.daysUntilOpen).toBe(0);
    });

    test('First day of month', () => {
      mockDate('2024-04-01');
      const result = getPaymentWindowStatus();
      expect(result.isOpen).toBe(true);
      expect(result.daysUntilOpen).toBe(0);
    });
  });
}); 