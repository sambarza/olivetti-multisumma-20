using olivetti from '../db/schema';

@path: '/api'
@requires: 'any'
service CalculatorService {

  // Arithmetic operations
  function add     (a : Decimal(20,8), b : Decimal(20,8)) returns Decimal(20,8);
  function subtract(a : Decimal(20,8), b : Decimal(20,8)) returns Decimal(20,8);
  function multiply(a : Decimal(20,8), b : Decimal(20,8)) returns Decimal(20,8);
  function divide  (a : Decimal(20,8), b : Decimal(20,8)) returns Decimal(20,8);

  // Layout persistence — getLayout is public, saveLayout requires login
  function getLayout()                                        returns LargeString;
  @requires: 'authenticated-user'
  action   saveLayout(data : LargeString)                    returns Boolean;
}
