class IndicatorQueryService

  class << self

    def query(indicators, user)
      result = {}
      group_indicators(indicators).each do |record_model, record_indicators|
        record_type = record_model.parent_form
        result[record_type] = {}
        group_indicators_by_scope(record_indicators).each do |_, scoped_indicators|
          search = record_query(record_model, scoped_indicators, user)
          stats = scoped_indicators.map { |i| [i.name, i.stats_from_search(search)] }.to_h
          result[record_type] = result[record_type].merge(stats)
        end
      end
      result
    end

    private

    def record_query(record_model, indicators, user)
      record_model.search do
        #TODO: set scope: user and module

        indicators.each do |indicator|
          indicator.query(self)
        end
      end
    end

    def group_indicators(indicators)
      indicators.group_by(&:record_model)
    end

    def group_indicators_by_scope(indicators)
      indicators.group_by do |indicator|
        indicator.scope&.map(&:to_h) || {}
      end
    end

  end

end