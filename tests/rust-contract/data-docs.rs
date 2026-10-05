use iracing_data_api_client::models::IracingServiceMethodDocs;
use serde_json::json;

#[test]
fn documentation_can_omit_parameters_and_retain_note_variants() {
    for note in [json!("direct array response"), json!(["image path note"])] {
        let value = json!({"link":"https://members-ng.iracing.com/data/car/get", "note":note});
        let parsed: IracingServiceMethodDocs = serde_json::from_value(value).unwrap();
        assert!(parsed.parameters.is_none());
        assert_eq!(serde_json::to_value(parsed).unwrap()["note"], note);
    }
}
