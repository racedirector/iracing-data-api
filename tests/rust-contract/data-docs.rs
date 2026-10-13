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

#[tokio::test]
async fn spectator_arrays_are_sent_as_single_csv_query_values() {
    use iracing_data_api_client::apis::{configuration::Configuration, season_api};
    use iracing_data_api_client::models::IracingEventType;
    use std::io::{BufRead, BufReader, Write};
    use std::net::TcpListener;
    use std::time::Duration;

    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let address = listener.local_addr().unwrap();
    let server = std::thread::spawn(move || {
        let (mut stream, _) = listener.accept().unwrap();
        stream
            .set_read_timeout(Some(Duration::from_secs(5)))
            .unwrap();
        let mut reader = BufReader::new(stream.try_clone().unwrap());
        let mut line = String::new();
        reader.read_line(&mut line).unwrap();
        let target = line.split_whitespace().nth(1).unwrap();
        let url = reqwest::Url::parse(&format!("http://localhost{target}")).unwrap();
        assert_eq!(url.path(), "/data/season/spectator_subsessionids_detail");
        assert_eq!(
            url.query_pairs().collect::<Vec<_>>(),
            vec![
                ("event_types".into(), "2,5".into()),
                ("season_ids".into(), "513,937".into()),
            ]
        );
        loop {
            line.clear();
            assert!(reader.read_line(&mut line).unwrap() > 0);
            if line == "\r\n" {
                break;
            }
        }
        let body = r#"{"link":"https://example.com/cache.json","expires":"2026-10-05T01:00:00Z"}"#;
        write!(stream, "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}", body.len(), body).unwrap();
    });
    let configuration = Configuration {
        base_path: format!("http://{address}"),
        client: reqwest::Client::builder()
            .no_proxy()
            .timeout(Duration::from_secs(5))
            .build()
            .unwrap(),
        ..Configuration::default()
    };
    let response = season_api::get_season_spectator_subsession_ids_detail(
        &configuration,
        season_api::GetSeasonSpectatorSubsessionIdsDetailParams {
            event_types: Some(vec![IracingEventType::Variant2, IracingEventType::Variant5]),
            season_ids: Some(vec![513.0, 937.0]),
        },
    )
    .await;
    server.join().unwrap();
    response.unwrap();
}

#[tokio::test]
async fn member_arrays_are_sent_as_single_csv_query_values() {
    use iracing_data_api_client::apis::{configuration::Configuration, member_api};
    use std::io::{BufRead, BufReader, Write};
    use std::net::TcpListener;
    use std::time::Duration;

    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let address = listener.local_addr().unwrap();
    let server = std::thread::spawn(move || {
        let (mut stream, _) = listener.accept().unwrap();
        stream
            .set_read_timeout(Some(Duration::from_secs(5)))
            .unwrap();
        let mut reader = BufReader::new(stream.try_clone().unwrap());
        let mut line = String::new();
        reader.read_line(&mut line).unwrap();
        let target = line.split_whitespace().nth(1).unwrap();
        let url = reqwest::Url::parse(&format!("http://localhost{target}")).unwrap();
        assert_eq!(url.path(), "/data/member/get");
        assert_eq!(
            url.query_pairs().collect::<Vec<_>>(),
            vec![
                ("cust_ids".into(), "2,3,2".into()),
                ("include_licenses".into(), "false".into()),
            ]
        );
        loop {
            line.clear();
            assert!(reader.read_line(&mut line).unwrap() > 0);
            if line == "\r\n" {
                break;
            }
        }
        let body = r#"{"link":"https://example.com/cache.json","expires":"2026-10-05T01:00:00Z"}"#;
        write!(stream, "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}", body.len(), body).unwrap();
    });
    let configuration = Configuration {
        base_path: format!("http://{address}"),
        client: reqwest::Client::builder()
            .no_proxy()
            .timeout(Duration::from_secs(5))
            .build()
            .unwrap(),
        ..Configuration::default()
    };
    let response = member_api::get_member(
        &configuration,
        member_api::GetMemberParams {
            cust_ids: vec!["2".into(), "3".into(), "2".into()],
            include_licenses: Some(false),
        },
    )
    .await;
    server.join().unwrap();
    response.unwrap();
}

#[test]
fn search_series_manifest_retains_typed_chunk_metadata_and_open_params() {
    use iracing_data_api_client::models::ResultsSearchSeriesResponse;
    for (names, rows, success) in [
        (vec![], 0, true),
        (vec!["chunk-0.json"], 3, true),
        (vec!["chunk-0.json", "chunk-1.json"], 750, true),
        (vec![], 0, false),
    ] {
        let manifest = json!({
            "type": "search_series_results",
            "data": {
                "success": success,
                "chunk_info": {
                    "chunk_size": 500, "num_chunks": names.len(), "rows": rows,
                    "base_download_url": "https://example.com/results/",
                    "chunk_file_names": names,
                },
                "params": {"cust_id": 7, "category_ids": [1, 2], "nested": {"retained": true}},
            },
        });
        let decoded: ResultsSearchSeriesResponse =
            serde_json::from_value(manifest.clone()).unwrap();
        assert_eq!(decoded.data.success, success);
        assert_eq!(decoded.data.chunk_info.rows, rows);
        assert_eq!(decoded.data.chunk_info.chunk_file_names, names);
        assert_eq!(serde_json::to_value(decoded).unwrap(), manifest);
    }
    assert!(
        serde_json::from_value::<ResultsSearchSeriesResponse>(json!({
            "link": "https://example.com/cache.json", "expires": "2026-10-05T01:00:00Z"
        }))
        .is_err()
    );
}
