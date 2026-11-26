// Illustrative single-file Spring Boot 3+ MVC example using Jakarta Validation.
// Verify dependency versions, package layout, and validation setup against the consuming project.
package example.orders;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
class OrderController {
    private final OrderService orderService;

    OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.create(request);
    }
}

record CreateOrderRequest(@NotBlank String reference) {}

record OrderResponse(String reference) {}

@Service
class OrderService {
    OrderResponse create(CreateOrderRequest request) {
        return new OrderResponse(request.reference());
    }
}
