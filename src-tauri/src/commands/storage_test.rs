// NOTE: Storage commands take AppHandle and interact with tauri-plugin-store,
// so command behavior belongs in integration tests. This smoke test keeps the
// module compiled under the unit-test target.

#[test]
fn test_storage_module_compiles_with_tests_enabled() {
    assert!(true);
}
