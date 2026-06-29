"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors = [];
        if (exception instanceof common_1.HttpException) {
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object') {
                const resp = exceptionResponse;
                message = resp.message || message;
                if (Array.isArray(resp.message)) {
                    errors = resp.message;
                    message = errors.join('; ');
                }
                else if (typeof resp.message === 'string') {
                    errors = [resp.message];
                    message = resp.message;
                }
            }
        }
        if (exception instanceof Error &&
            'code' in exception &&
            exception.code === 'P2002') {
            statusCode = common_1.HttpStatus.CONFLICT;
            message = 'A record with this value already exists';
            errors = ['Duplicate field value'];
        }
        if (exception instanceof Error &&
            'code' in exception &&
            exception.code === 'P2025') {
            statusCode = common_1.HttpStatus.NOT_FOUND;
            message = 'Resource not found';
            errors = ['The requested resource does not exist'];
        }
        const errorResponse = {
            statusCode,
            message,
            errors,
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        response.status(statusCode).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map