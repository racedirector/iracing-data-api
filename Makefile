protoc:
	make protoc-codegen
	make protoc-web
	make protoc-node
	make protoc-json-schema

protoc-web:
	# Make the directory if it doesn't exist
	mkdir -p ./packages/iracing-telemetry-grpc-web/src/constants/iracing-proto

	# Generate grpc-web clients and typescript types for the telemetry and broadcast proto.
	protoc -I=. ./iracing-proto/telemetry.proto ./iracing-proto/broadcast.proto \
		--plugin=protoc-gen-grpc-web=./node_modules/.bin/protoc-gen-grpc-web \
		--js_out=import_style=commonjs:./packages/iracing-telemetry-grpc-web/src/constants \
		--grpc-web_out=import_style=typescript,mode=grpcwebtext:./packages/iracing-telemetry-grpc-web/src/constants

protoc-node:
	# Make the directory if it doesn't exist
	mkdir -p ./packages/iracing-telemetry-grpc-node/src/constants/iracing-proto

	# Generate grpc-web clients and typescript types for the telemetry and broadcast proto.
	protoc -I=. ./iracing-proto/telemetry.proto ./iracing-proto/broadcast.proto \
		--plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
		--ts_opt=unary_rpc_promise=true \
		--ts_opt=target=node \
		--ts_out=./packages/iracing-telemetry-grpc-node/src/constants \
		--js_out=import_style=commonjs:./packages/iracing-telemetry-grpc-node/src/constants \

protoc-codegen:
	# Make the directory if it doesn't exist
	mkdir -p ./packages/iracing-telemetry-types/scripts/constants/iracing-proto

	protoc --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
		--ts_opt=unary_rpc_promise=true \
		--ts_opt=target=node \
		--ts_out=./packages/iracing-telemetry-types/scripts/constants \
		./iracing-proto/schema.proto 

protoc-json-schema:
	# Make the directory if it doesn't exist
	mkdir -p ./packages/helpers/sync-telemetry-json-schema/src/constants/iracing-proto

	protoc --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
		--ts_opt=unary_rpc_promise=true \
		--ts_opt=target=node \
		--ts_out=./packages/helpers/sync-telemetry-json-schema/src/constants \
		./iracing-proto/schema.proto 