using olivetti from '../db/schema';

@path: '/api'
service CalculatorService {

  // Arithmetic operations
  function add     (a : Decimal(20,8), b : Decimal(20,8)) returns Decimal(20,8);
  function subtract(a : Decimal(20,8), b : Decimal(20,8)) returns Decimal(20,8);
  function multiply(a : Decimal(20,8), b : Decimal(20,8)) returns Decimal(20,8);
  function divide  (a : Decimal(20,8), b : Decimal(20,8)) returns Decimal(20,8);

  // Layout persistence
  function getLayout()                   returns LargeString;
  action   saveLayout(data : LargeString) returns Boolean;
}
