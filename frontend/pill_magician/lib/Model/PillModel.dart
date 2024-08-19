class PillFeatures {
  String? item_name;
  String? entp_name;
  String? drug_shape;
  String? color_class1;
  String? color_class2;
  String? print_front;
  String? print_back;


  PillFeatures({
    this.item_name,
    this.entp_name,
    this.drug_shape,
    this.color_class1,
    this.color_class2,
    this.print_front,
    this.print_back

  });


  Map<String, dynamic> toJson() {
    return {
      'item_name': item_name,
      'entp_name': entp_name,
      'drug_shape': drug_shape,
      'color_class1': color_class1,
      'color_class2': color_class2,
      'print_front': print_front,
      'print_back': print_back
    };
  }
}
