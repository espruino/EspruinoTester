// This is uploaded *before* every test to provide utils for testing

var _tests_pass = 0, _tests_fail = 0;
function _test_end() {
  if (_tests_fail==0) {
    print("[TEST] PASS");
  } else {
    print("[TEST] FAIL", e);  
  });
}
function assert_true(a) { if (a) _tests_pass++; else { _tests_fail++; print("[TEST] Assertion failed"); } }
function assert_false(a) { assert_true(!a); }
function assert_equals(a,b) { assert_true(a==b); }
function test(fn, name) {
  _tests_pass = 0;
  _tests_fail = 0;
  fn();
  if (_tests_fail==0) {
  } el
}
function promise_test(fn, name) {
  fn().then(() => {
    _test_end();
  }, e => {
    print(e);
    _tests_fail++;
    _test_end();
  });
}
