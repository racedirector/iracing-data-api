protoc:
	make protoc-codegen
	make protoc-web
	make protoc-node

protoc-web:
	# Make the directory if it doesn't exist
	mkdir -p ./packages/iracing-telemetry-grpc-web/src/constants/proto

	# Generate grpc-web clients and typescript types for the telemetry and broadcast proto.
	protoc -I=. ./proto/telemetry.proto ./proto/broadcast.proto \
		--plugin=protoc-gen-grpc-web=./node_modules/.bin/protoc-gen-grpc-web \
		--js_out=import_style=commonjs:./packages/iracing-telemetry-grpc-web/src/constants \
		--grpc-web_out=import_style=typescript,mode=grpcwebtext:./packages/iracing-telemetry-grpc-web/src/constants

protoc-node:
	# Make the directory if it doesn't exist
	mkdir -p ./packages/iracing-telemetry-grpc-node/src/constants/proto

	# Generate grpc-web clients and typescript types for the telemetry and broadcast proto.
	protoc -I=. ./proto/telemetry.proto ./proto/broadcast.proto \
		--plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
		--ts_opt=unary_rpc_promise=true \
		--ts_opt=target=node \
		--ts_out=./packages/iracing-telemetry-grpc-node/src/constants \
		--js_out=import_style=commonjs:./packages/iracing-telemetry-grpc-node/src/constants \

protoc-codegen:
	# Make the directory if it doesn't exist
	mkdir -p ./packages/iracing-telemetry-types/scripts/constants/proto

	protoc --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
		--ts_opt=unary_rpc_promise=true \
		--ts_opt=target=node \
		--ts_out=./packages/iracing-telemetry-types/scripts/constants \
		./proto/schema.proto 