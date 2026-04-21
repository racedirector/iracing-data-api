use clap::Parser;
use iracing_data_api_client::apis::{
    configuration::Configuration,
    member_api::{self, GetMemberParams},
};
use serde_json::Value;
use std::error::Error;

#[derive(Debug, Parser)]
#[command(author, version, about = "Fetch iRacing member data for customer IDs")]
struct Cli {
    /// Bearer access token used to sign the request.
    #[arg(long)]
    access_token: String,

    /// Comma-separated customer IDs to fetch.
    #[arg(long, value_delimiter = ',', num_args = 1.., value_name = "CSV")]
    customer_ids: Vec<String>,

    /// Include licenses in the Member API response.
    #[arg(long)]
    include_licenses: bool,
}

fn normalize_customer_ids(customer_ids: &[String]) -> Result<String, Box<dyn Error>> {
    let ids: Vec<&str> = customer_ids
        .iter()
        .map(String::as_str)
        .map(str::trim)
        .filter(|id| !id.is_empty())
        .collect();

    if ids.is_empty() {
        return Err("at least one customer ID must be provided".into());
    }

    Ok(ids.join(","))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let cli = Cli::parse();
    let cust_ids = normalize_customer_ids(&cli.customer_ids)?;

    let mut configuration = Configuration::new();
    configuration.bearer_access_token = Some(cli.access_token);

    let response = member_api::get_member(
        &configuration,
        GetMemberParams {
            cust_ids,
            include_licenses: cli.include_licenses.then_some(true),
        },
    )
    .await?;

    let data_text = configuration
        .client
        .get(&response.link)
        .send()
        .await?
        .error_for_status()?
        .text()
        .await?;

    let data = serde_json::from_str::<Value>(&data_text).unwrap_or(Value::String(data_text));

    let output = serde_json::json!({
        "response": response,
        "data": data,
    });

    println!("{}", serde_json::to_string_pretty(&output)?);
    Ok(())
}
