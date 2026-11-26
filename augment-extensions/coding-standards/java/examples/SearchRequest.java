// Illustrative Java 17 example. Adapt nullness and validation choices to the consuming project.
import java.util.List;
import java.util.Objects;

public record SearchRequest(String term, List<String> tags) {
    public SearchRequest {
        term = Objects.requireNonNull(term, "term").strip();
        if (term.isEmpty()) {
            throw new IllegalArgumentException("term must not be blank");
        }
        tags = List.copyOf(tags);
    }
}
