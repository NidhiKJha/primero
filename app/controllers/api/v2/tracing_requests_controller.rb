# frozen_string_literal: true

# Main API controller for Tracing Request records
class Api::V2::TracingRequestsController < ApplicationApiController
  include Concerns::Pagination
  include Concerns::Record
end
